// Function to format the dates
export function formatEssayDates() {
  const dateElements = document.querySelectorAll(".essay-date");

  if (!dateElements) {
    return;
  }

  dateElements.forEach(function (element) {
    const rawDate = element.getAttribute("data-date");
    const locale = config.language || "en";

    const formattedDate = moment(rawDate).locale(locale).calendar();
    element.textContent = formattedDate;
  });
}
