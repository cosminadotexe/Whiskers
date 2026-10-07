# Whiskers

Whiskers is a cat-themed take on Minesweeper. You play as a curious cat sniffing out mice hidden around the yard. Reveal every safe square without startling a mouse, and you win.

It's a small, dependency-free browser game built with plain HTML, CSS and JavaScript.

**[Play Whiskers in your browser](https://cosminadotexe.github.io/Whiskers/)**

## Playing

You can play online at the link above, or run it locally. There's no build step or install: open `index.html` in any modern browser and start playing.

### Controls

| Action | What it does |
| --- | --- |
| Left click | Reveal a square |
| Right click | Place or remove a flag where you think a mouse is hiding |
| Left click on a number | "Chord": if you've flagged as many neighbours as the number says, reveal the rest around it |
| Cat button | Start a new game |

Your first click is always safe.

### Difficulty levels

Each level is a different place to hunt, with its own look.

| Level | Grid | Mice |
| --- | --- | --- |
| Garden | 9 × 9 | 10 |
| Backyard | 12 × 12 | 30 |
| Attic | 16 × 16 | 50 |

The counter on the left shows how many mice are still unflagged, and the timer on the right counts your seconds.

## Contributing

Bug reports and suggestions are welcome. If you'd like to change something, please open an issue first so we can talk it through.

## License

Released under the [MIT License](LICENSE).
