import { Avatar, OwnershipTransferred } from "../../types/Avatar/Avatar";
import { AvatarContract } from "../../types/schema";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let avatar = AvatarContract.load(event.address.toHex());
  if (avatar == null) {
    avatar = new AvatarContract(event.address.toHex());
    let avatarSC = Avatar.bind(event.address);
    avatar.address = event.address;
    avatar.name = avatarSC.orgName();
    avatar.reputation = avatarSC.nativeReputation();
  }
  avatar.owner = event.params.newOwner;
  avatar.save();
}
