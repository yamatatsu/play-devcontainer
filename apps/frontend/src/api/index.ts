import { client } from "./client";

export async function getTasks() {
  const res = await client.tasks.$get();

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  switch (res.status) {
    case 200:
      return res.json();
    default:
      throw new Error(
        `Unexpected status code: ${res.status}: ${await res.text()}`,
      );
  }
}
