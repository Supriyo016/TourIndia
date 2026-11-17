import { randomInt } from "node:crypto";

/** Ticket references like "S-7KQ2-M9XD": short enough to read out, with no 0/O or 1/I confusion. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export function newTicketReference(): string {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `S-${part()}-${part()}`;
}
