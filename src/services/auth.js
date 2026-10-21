async function readJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  return {
    success: false,
    message: `Unexpected non-JSON response (${res.status})`,
  };
}

export async function loginUser({ username, password }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await readJsonResponse(res);

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}


export async function logoutUser() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await readJsonResponse(res);

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
}