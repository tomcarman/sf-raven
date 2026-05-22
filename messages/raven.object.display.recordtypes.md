# summary

Show RecordType information for a given sObject.

# description

RecordType metadata is queried for the given sObject. The RecordType Name, DeveloperName, and Id are displayed.

# flags.target-org.summary

Login username or alias for the target org.

# flags.sobject.summary

The API name of the sObject that you want to view Record Types for. Use a comma-delimited list to query multiple objects.

# flags.csv.summary

Path to write Record Type information as CSV. When supplied, table output is suppressed.

# info.csvWritten

Wrote %s Record Types to %s.

# examples

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account

- <%= config.bin %> <%= command.id %> --target-org dev --sobject My_Custom_Object\_\_c

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account,Opportunity

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account --csv account-record-types.csv
