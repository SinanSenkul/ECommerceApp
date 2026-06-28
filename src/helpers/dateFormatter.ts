interface FirestoreTimestampLike {
  seconds?: number;
  nanoseconds?: number;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function formatFirestoreDate(ts?: FirestoreTimestampLike | Date) {
  if (ts instanceof Date) {
    return formatDate(ts);
  }

  if (typeof ts?.seconds !== "number") {
    return "-";
  }

  const millis =
    ts.seconds * 1000 + Math.floor((ts.nanoseconds ?? 0) / 1000000);

  return formatDate(new Date(millis));
}
