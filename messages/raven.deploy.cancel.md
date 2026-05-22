# summary

Cancel a pending or in-progress Salesforce deploy.

# description

Query the target org for pending or in-progress deploy requests, select one from an interactive list, confirm the cancellation, and submit an asynchronous deploy cancel request.

# examples

Cancel a deploy in the default org:

<%= config.bin %> <%= command.id %>

Cancel a deploy in a specific org:

<%= config.bin %> <%= command.id %> --target-org dev

# flags.target-org.summary

Login username or alias for the target org. Uses the default org when omitted.

# info.loadingDeploys

🔎 Loading pending and in-progress deploys...

# info.noDeploys

✅ No pending or in-progress deploys found.

# info.noSelection

↩️  No deploy was selected.

# info.cancelAborted

↩️  Deploy cancel aborted.

# info.cancelSubmitted

🛑 Deploy cancel submitted for job %s.

# prompt.selectDeploy

Select a deploy to cancel

# prompt.confirmCancel

Are you sure you want to cancel job %s

# label.unknownStartDate

Unknown start time

# label.inProgress

🟢 In Progress

# label.pending

🟡 Pending

# label.cancel

Cancel

# error.cancelFailed

sf project deploy cancel failed with exit code %s.

# error.noTargetOrg

No target org was supplied and no default target org was resolved.
