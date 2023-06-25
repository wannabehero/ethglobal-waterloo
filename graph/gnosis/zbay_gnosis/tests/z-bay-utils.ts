import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  ProductCancelled,
  ProductCreated,
  ProductDelivered,
  ProductDispatched,
  ProductDisputed,
  ProductPurchased,
  ProductResolved
} from "../generated/ZBay/ZBay"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createProductCancelledEvent(id: BigInt): ProductCancelled {
  let productCancelledEvent = changetype<ProductCancelled>(newMockEvent())

  productCancelledEvent.parameters = new Array()

  productCancelledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return productCancelledEvent
}

export function createProductCreatedEvent(
  id: BigInt,
  seller: Address,
  price: BigInt,
  cid: Bytes
): ProductCreated {
  let productCreatedEvent = changetype<ProductCreated>(newMockEvent())

  productCreatedEvent.parameters = new Array()

  productCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  productCreatedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  productCreatedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  productCreatedEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromBytes(cid))
  )

  return productCreatedEvent
}

export function createProductDeliveredEvent(id: BigInt): ProductDelivered {
  let productDeliveredEvent = changetype<ProductDelivered>(newMockEvent())

  productDeliveredEvent.parameters = new Array()

  productDeliveredEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return productDeliveredEvent
}

export function createProductDispatchedEvent(id: BigInt): ProductDispatched {
  let productDispatchedEvent = changetype<ProductDispatched>(newMockEvent())

  productDispatchedEvent.parameters = new Array()

  productDispatchedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return productDispatchedEvent
}

export function createProductDisputedEvent(id: BigInt): ProductDisputed {
  let productDisputedEvent = changetype<ProductDisputed>(newMockEvent())

  productDisputedEvent.parameters = new Array()

  productDisputedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return productDisputedEvent
}

export function createProductPurchasedEvent(
  id: BigInt,
  buyer: Address
): ProductPurchased {
  let productPurchasedEvent = changetype<ProductPurchased>(newMockEvent())

  productPurchasedEvent.parameters = new Array()

  productPurchasedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  productPurchasedEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )

  return productPurchasedEvent
}

export function createProductResolvedEvent(
  id: BigInt,
  successfully: boolean
): ProductResolved {
  let productResolvedEvent = changetype<ProductResolved>(newMockEvent())

  productResolvedEvent.parameters = new Array()

  productResolvedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  productResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "successfully",
      ethereum.Value.fromBoolean(successfully)
    )
  )

  return productResolvedEvent
}
