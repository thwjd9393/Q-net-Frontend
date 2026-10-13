# Q-Net-Frontend
Q-Net project frontend

## API configuration

Set `VITE_API_BASE_URL` in `.env` to the backend origin
(for local development, `http://127.0.0.1:8000`). Restart Vite after changing the value.

Calendar OAuth callbacks are sent only to `POST /calendar/google/callback`.
The frontend does not automatically exchange OAuth codes through `POST /auth/google`.
Existing app token refresh behavior remains separate from Calendar authorization.

The certificate detail page resolves the certificate UUID from `GET /certificates`,
loads its official data from `GET /certificates/{certificate_id}`, and loads the
selected year's schedule rows from
`GET /certificates/{certificate_id}/schedules?year={year}`. Schedule cards display
the API's `registration_periods`; an empty schedule response means no schedule data
is currently collected, not that the exam will not be held.

Google Calendar uses `GET /calendar/google/authorize` and
`POST /calendar/google/callback`, separately from Google login. Open the frontend
using the same host and port configured in the backend's Calendar redirect URI
(currently `http://localhost:5500/callback.html`). The build includes `callback.html`
and `calendar-callback.html`. Grant Calendar access, then confirm the selected
event types in the dialog. Registration sends the schedule UUID, `updated_at`,
selected event types, and a reusable UUID `Idempotency-Key` to `POST /calendar/register`.
Only actual API registration results are stored in `localStorage` and shown on
the account pages; partial and unconfirmed results are labeled separately.

## Temporary login bypass

During development, opening `login.html` redirects to the home page and navigation to
otherwise protected pages skips the login screen. Restore the authentication gate when
login is ready to be tested.
