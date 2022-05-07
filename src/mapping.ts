import {
  Transfer as TransferEvent,
  Token as TokenContract,
} from "../generated/Token/Token";
import { ipfs, json, JSONValue } from "@graphprotocol/graph-ts";

import { Token, User } from "../generated/schema";

const ipfshash = "Qmcm7hNmHKEmMqHUwLYeMftTzk8fuE4r4xraBJ7YzMazUx";

export function handleTransfer(event: TransferEvent): void {
  const id = event.params.tokenId.toString();
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.tokenID = event.params.tokenId;
    token.tokenURI = "/" + event.params.tokenId.toString() + ".json";

    let metadata = ipfs.cat(ipfshash + token.tokenURI);
    if (metadata) {
      const value = json.fromBytes(metadata).toObject();
      if (value) {
        const image = value.get("image");
        const name = value.get("name");
        const description = value.get("description");
        if (name && image && description) {
          token.name = name.toString();
          token.image = image.toString();
          token.description = description.toString();
          token.ipfsURI = "ipfs.io/ipfs/" + ipfshash + token.tokenURI;
        }

        let attributes: JSONValue[] = [];
        let atts = value.get("attributes");
        if (atts) {
          attributes = atts.toArray();
        }

        for (let i = 0; i < attributes.length; i++) {
          let item = attributes[i].toObject();
          let trait: string = "";
          let t = item.get("trait_type");
          if (t) {
            t.toString();
          }
          let value: string = "";
          let v = item.get("value");
          if (v) {
            value = v.toString();
          }
          if (trait == "Background") {
            token.background = value;
          }

          if (trait == "Eyes") {
            token.eyes = value;
          }

          if (trait == "Skins") {
            token.skins = value;
          }

          if (trait == "Accessories") {
            token.accessories = value;
          }

          if (trait == "Clothes") {
            token.clothes = value;
          }

          if (trait == "Hair") {
            token.hair = value;
          }
          if (trait == "Lips") {
            token.lips = value;
          }
        }
      }
    }
    token.updatedAtTimestamp = event.block.timestamp;
    token.owner = event.params.to.toHexString();
    token.save();

    let user = User.load(event.params.to.toHexString());
    if (!user) {
      user = new User(event.params.to.toHexString());
      user.save();
    }
  }
}
