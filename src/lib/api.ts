const webapp =
  "pelotonmeilsen-funcs-chhgdfdrdbc2gtc2.westeurope-01.azurewebsites.net";

export async function getMembers() {
  try {
    const apiUrl = `https://${webapp}/api/members`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching members:", error);
    // Return mock data as fallback
    return undefined;
  }
}
