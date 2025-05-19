export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  const formatter = new Intl.DateTimeFormat("en-CA", options); // "en-CA" ensures for 'Month DD, YYYY' format
  return formatter.format(date);
};
