export default function logTable(
  rows: any[],
  fields: string[],
  colWidths?: number[]
) {
  if (typeof window === "undefined") {
    const Table = require("cli-table");
    const table = new Table({
      head: fields,
      colWidths
    });
    rows.forEach(row => {
      table.push(fields.map(field => row[field]));
    });
    console.log(table.toString());
  } else {
    console.table(rows, fields);
  }
}
