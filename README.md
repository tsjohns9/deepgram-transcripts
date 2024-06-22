# Run

Start the server
```
node server.js
```

Or use from the CLI
```
node transcript.js
```

# Deploy app

```
fly deploy
```

# Set env vars

```
flyctl secrets set $KEY=$VALUE -a deepgram-transcripts
```

# SSH to server

flyctl ssh console -a deepgram-transcripts