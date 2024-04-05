import { type Media } from "alchemy-sdk";

import { type NftMedia } from "../types";

export function getMediaObjectFromAlchemyMedia(
  alchemyMedia: Media | undefined
): NftMedia {
  if (alchemyMedia === undefined) {
    return { format: "image", src: undefined };
  }
  const mediaSrc =
    alchemyMedia?.gateway ?? alchemyMedia?.thumbnail ?? alchemyMedia?.raw;
  const mediaFormat = alchemyMedia?.format === "mp4" ? "video" : "image";

  return { format: mediaFormat, src: mediaSrc };
}
