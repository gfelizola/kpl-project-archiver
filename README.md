# kpl-project-archiver
Send all cards in done column in a e-mail and remove it from project

# Install
```
npm install -g kpl-project-archiver
```

# Usage

Generate a GitHub API Token at https://github.com/settings/tokens
and save it in a env var called `GITHUB_API_TOKEN` with:

```
export GITHUB_API_TOKEN='my-generated-token'
```

This project uses the Express SendGrid Key. You need to set a env variable for that too.
If you havent this key, contact the archtecture team.

```
export SENDGRID_API_KEY="<SEND_GRID_KEY>"
```

(you can change your `~/.bash_profile` to work in all terminal sessions).

Then:

```
kpl-project-archiver
```