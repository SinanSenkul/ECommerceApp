export function formatFirestoreDate(ts) {
  if (!ts?.seconds) return "—"; // guard against invalid/missing

  // seconds → milliseconds + nanoseconds part
  const millis = ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1000000);

  const date = new Date(millis);

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
