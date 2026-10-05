# Glu Movie SDK

A client for the MovieGlu API. Talk about films using the API's own words.

## Language

**Film**:
A motion picture listed by the API, identified by `film_id`.
_Avoid_: Movie

**NowShowing**:
Films currently showing, from the `filmsNowShowing` endpoint.
_Avoid_: Now-showing list, movies list

**ComingSoon**:
Films scheduled for future release, from the `filmsComingSoon` endpoint. Item shape is identical to a NowShowing film.

**Territory**:
The country market the request is licensed for, sent as the `territory` header.

**DeviceDatetime**:
The requesting device's current local time, sent as the `device-datetime` header in ISO 8601 without offset. Filters out past showtimes.
