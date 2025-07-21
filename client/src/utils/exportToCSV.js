// exportToCSV.js
// Utility to export array of objects to CSV and trigger download

export default function exportToCSV(data, filename = "export.csv") {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] !== undefined ? row[header] : '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
} 