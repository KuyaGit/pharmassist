export async function logout() {
  try {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/pharmassist";
  } catch (error) {
    console.error("Error during logout:", error);
  }
}
