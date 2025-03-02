import type { AstroIntegration } from "astro";
import type { GalleryEvent, GalleryImage } from "../models/Gallery";
import { promises as fs } from "fs";
import path from "path";

async function loadGalleryEvents(): Promise<GalleryEvent[]> {
  try {
    const events: GalleryEvent[] = [];
    const publicGalleryPath = path.join(process.cwd(), "public/gallery");

    // Check if gallery directory exists
    try {
      await fs.access(publicGalleryPath);
    } catch (error) {
      console.warn("Gallery directory not found:", publicGalleryPath);
      return [];
    }

    // Get all event directories
    const eventDirs = await fs.readdir(publicGalleryPath);

    for (const eventDir of eventDirs) {
      // Skip files and hidden directories
      if (eventDir.startsWith(".") || eventDir === "README.md") continue;

      const eventPath = path.join(publicGalleryPath, eventDir);
      const stats = await fs.stat(eventPath);

      if (!stats.isDirectory()) continue;

      try {
        // Read metadata.json
        const metadataPath = path.join(eventPath, "metadata.json");
        let metadata;

        try {
          const metadataContent = await fs.readFile(metadataPath, "utf-8");
          metadata = JSON.parse(metadataContent);
        } catch (err) {
          console.warn(`No metadata.json found in ${eventDir}, skipping`);
          continue;
        }

        // Get all images in the event directory
        const files = await fs.readdir(eventPath);
        const imageFiles = files.filter(
          (file) =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && file !== "metadata.json"
        );

        if (imageFiles.length === 0) {
          console.warn(`No images found in event directory: ${eventDir}`);
          continue;
        }

        // Find cover image if it exists
        const coverImageFile =
          imageFiles.find((file) => file.toLowerCase().includes("cover")) ||
          imageFiles[0];

        const coverImagePath = coverImageFile
          ? `/gallery/${eventDir}/${coverImageFile}`
          : undefined;

        // Process all images
        const eventImages: GalleryImage[] = [];
        for (const imageFile of imageFiles) {
          if (imageFile === coverImageFile) continue;

          const fileName = imageFile.split(".")[0];
          const alt = fileName.replace(/[-_]/g, " "); // Use filename as alt text, replacing dashes and underscores with spaces

          eventImages.push({
            src: `/gallery/${eventDir}/${imageFile}`,
            alt,
            caption: alt,
          });
        }

        // Create data file in src/data/gallery
        const dataDir = path.join(process.cwd(), "src/data/gallery");
        try {
          await fs.mkdir(dataDir, { recursive: true });
        } catch (err) {
          console.error(`Error creating directory ${dataDir}:`, err);
        }

        // Create the data file with metadata and image URLs
        const eventData = {
          id: eventDir,
          title: metadata.title,
          description: metadata.description,
          date: metadata.date,
          coverImage: coverImagePath,
          images: eventImages,
        };

        const dataFilePath = path.join(dataDir, `${eventDir}.json`);
        await fs.writeFile(dataFilePath, JSON.stringify(eventData, null, 2));

        events.push(eventData);
      } catch (error) {
        console.error(`Error processing event ${eventDir}:`, error);
      }
    }

    return events;
  } catch (error) {
    console.error("Error loading gallery events:", error);
    return [];
  }
}

export default {
  name: "my-astro-integration",
  hooks: {
    "astro:config:setup": async () => {
      await loadGalleryEvents();
      console.log("✅ Gallery data files generated");
    },
  },
} satisfies AstroIntegration;
