# excel2csv

Convert Excel files to CSV

## Installation

To install locally:

```sh
npm install excel2csv
```

To install globally:

```sh
npm install -g excel2csv
```

## Standalone Use Case

To use as a standalone application, install globally. To get help

```sh
excel2csv -h
```

To convert a `xlsx` or `xls` file to `csv`:

```sh
excel2csv -o output.csv input.xlsx
```

If output filename is not provided via `-o` or `--output` option, the same filename as the input will be used with `.csv` extension.

The sheet to be converted can be provided either using a 0-based index or its name. To provide the sheet index, `-n` or `--sheet-index` can be used followed by an index. If not present, index 0 will be used. To provide a sheet name, `-s` or `--sheet-name` options can be used followed by a sheet name. If either the sheet index or name are invalid, the first sheet will be converted by default. If both sheet index and name options are present, the sheet name will be ignored.

## Local Use Case

To use locally, install the package in the local directory. Then, the package can be imported as:

```js
const excel2csv = require('excel2csv');
```

The package includes `convert` function with the following arguments:

```js
excel2csv.convert(excelPath, options);
```

`excelPath` is a string path to the input Excel file. `options` object is optional and has the following format:

```js
options = {
    csvPath, // string path to the output CSV file
    sheetIndex, // optional, 0-based index of the Excel sheet to be converted to CSV (default is 0)
    sheetName, // optional, sheet name in the Excel file to be converted to CSV
    writeCsv, // if true, the output will be written to a file, otherwise will be returned by the function
}
```

In the `options`, any invalid `sheetIndex` or `sheetName` results into the first sheet being converted. If both `sheetIndex` and `sheetName` are present, `sheetName` is ignored.

The `convert` function returns a promise. If the `writeCsv` option is `true`, the function returns a boolean promise, which is `true` if file is successfully written, and `false` otherwise. If `writeCsv` is set to `false` (default value), the `convert` function returns a string promise containing the CSV output.
