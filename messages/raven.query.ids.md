# summary

Run a SOQL query against a large list of Salesforce IDs.

# description

Read Salesforce IDs from a file, deduplicate and validate them, split them into safe query batches, and run a SOQL query with the IDs inserted at the {ids} placeholder.

# examples

Query accounts from a file of IDs:

<%= config.bin %> <%= command.id %> --file account-ids.txt --query "SELECT Id, Name FROM Account WHERE Id IN {ids}"

Query opportunities by AccountId:

<%= config.bin %> <%= command.id %> --file account-ids.txt --query "SELECT Id, Name FROM Opportunity WHERE AccountId IN {ids}"

Test with the first 25 unique IDs:

<%= config.bin %> <%= command.id %> --file account-ids.txt --query "SELECT Id, Name FROM Account WHERE Id IN {ids}" --limit 25

Write results to CSV:

<%= config.bin %> <%= command.id %> --file account-ids.txt --query "SELECT Id, Name FROM Account WHERE Id IN {ids}" --csv results.csv

# flags.target-org.summary

Login username or alias for the target org. Uses the default org when omitted.

# flags.file.summary

Path to a file containing one Salesforce ID per row.

# flags.query.summary

SOQL query to run. Must include the {ids} placeholder where the ID list should be inserted.

# flags.batch-size.summary

Number of IDs to include in each query batch. By default, batches are sized to fit Salesforce URI limits.

# flags.csv.summary

Path to write query results as CSV. When supplied, table output is suppressed.

# flags.limit.summary

Process only the first N unique valid IDs from the file.

# info.queryingBatch

Querying batch %s/%s...

# info.csvWritten

Wrote %s records to %s.

# info.summary

Queried %s IDs across %s batches. Returned %s records. Removed %s duplicate IDs.

# info.noRecords

No records returned.

# error.noTargetOrg

No target org was supplied and no default target org was resolved.

# error.noIds

No IDs were found to query.

# error.invalidId

Invalid Salesforce ID found: %s.

# error.invalidPlaceholder

The query must contain exactly one %s placeholder.

# error.queryTooLongForSingleId

The query is too long to fit Salesforce URI limits even with a single ID: %s.
