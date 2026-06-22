# Investor Map Demo Design

## Goal

Create a standalone investor-facing demo page that visually communicates the route-generation concept before the real map/API implementation is complete.

The page should look like a travel攻略 map: a map-like surface, a highlighted route, numbered stops, floating attraction cards, route stats, and a written route explanation.

## Scope

Use the existing `pages/route-map.html` as the dedicated demo area.

The first demo will use a fixed Beijing one-day route:

1. Tiananmen Square
2. Palace Museum
3. Jingshan Park
4. Beihai Park
5. Shichahai
6. Nanluoguxiang

No real map API is required for this first version. The map will be rendered with HTML/CSS/SVG so it is reliable for a live presentation and works without API keys.

## User Experience

The page should show:

- A top demo header with route title, total distance, total play time, budget, and recommended audience.
- A large visual map board with a stylized Beijing map background.
- A colored route polyline connecting numbered scenic stops.
- Floating attraction cards beside the route with name, duration, highlights, tickets/opening notes, and tags.
- A right-side or overlay itinerary panel with morning, afternoon, and evening sections.
- A bottom route explanation similar to the reference screenshots.
- A "Generate Beijing Demo Route" action that refreshes/replays the demo state.

## Data Flow

All demo route data lives in front-end JavaScript on the page:

- Route metadata
- Stop coordinates as percentage positions on the custom map surface
- Stop card details
- Segment distance/time labels
- Itinerary explanation text

Later, these fields can be replaced by backend route-generation and map API data.

## Error Handling

Because this is a static demo, the page should not depend on network APIs. If external images fail, the page still works using CSS shapes and text.

## Testing

Manual verification is enough for the demo:

- Open the page through a local static server.
- Confirm the route map is visible.
- Confirm all six stops, route line, stats, and explanation render.
- Confirm the demo action works.
- Check desktop viewport first; mobile can stack the panels.
