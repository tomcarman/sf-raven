# summary

Show recent entries in the Setup Audit Trail.

# description

Returns the 20 most recent Setup Audit Trail entries, but this can be increased up to 2000 using the optional --limit flag. The results can be filtered by a particular user using the --username flag.

# flags.target-org.summary

Login username or alias for the target org.

# flags.username.summary

Username to filter the audit trail by.

# flags.limit.summary

The number of audit trail entries to return. Maximum is 2000.

# examples

- <%= config.bin %> <%= command.id %> --target-org dev
- <%= config.bin %> <%= command.id %> --target-org dev --limit 200
- <%= config.bin %> <%= command.id %> --target-org dev --username username@salesforce.com.dev
- <%= config.bin %> <%= command.id %> --target-org dev --limit 50 --username username@salesforce.com.dev
