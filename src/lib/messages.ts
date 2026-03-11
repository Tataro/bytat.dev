const messages = [
  "yo, what's good",
  "hey fellas",
  "how's it going",
  "sup, glad you're here",
  "oh hey, didn't see you there",
  "well well well",
  "look who showed up",
  "ayy, you made it",
  "pull up a chair",
  "nice of you to drop by",
  "fancy seeing you here",
  "what's the move",
  "good vibes only from here",
];

export function getRandomMessage(): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
