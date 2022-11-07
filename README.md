# Yimby SF Data Aggregator

![](https://user-images.githubusercontent.com/169280/200293675-07d377ed-8034-4cc5-9fb2-4a2b064d0cac.png)

### Programs

- `dl-pc` downloads Planning Commission minutes
  - Reads https://sfplanning.org/cpc-hearing-archives
  - Output: folder full of PDFs
- `parse-pc` parses case updates into a database
  - Input: folder full of PDFs
  - Output: Sqlite DB
