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

**FilmDetails**:
Full record for one film, from the `filmDetails` endpoint (`?film_id=`). Base fields match the list items (but `film_trailer` is replaced by `trailers`), plus credits, genres, show dates and alternate versions. `status` travels inline.

**Cinema**:
A venue showing films, identified by `cinema_id`, from the `cinemaDetails` endpoint (`?cinema_id=`). `status` travels inline.
_Avoid_: Theater (API vocabulary is cinema)

**CinemasNearby**:
Cinemas near the request geolocation ordered by distance, from the `cinemasNearby` endpoint. Items are a trimmed subset of `CinemaDetails` (no country, phone, ticketing, directions or show dates).

**Showtimes**:
Screening times joining one cinema with its films, from the `cinemaShowTimes` endpoint (`?film_id=&cinema_id=&date=`). `film_id` scopes but may return several films. `status` travels inline.

**FilmShowtimes**:
Screening times joining one film with its cinemas, from the `filmShowTimes` endpoint (`?film_id=&date=`). Mirror of Showtimes: times carry `end_time` and version keys reference alternate `film_id`s. `status` travels inline.

**Territory**:
The country market the request is licensed for, sent as the `territory` header.

**DeviceDatetime**:
The requesting device's current local time, sent as the `device-datetime` header in ISO 8601 without offset. Filters out past showtimes.
