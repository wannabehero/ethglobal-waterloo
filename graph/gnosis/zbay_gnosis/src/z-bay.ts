import {
  OwnershipTransferred as OwnershipTransferredEvent,
  ProductCancelled as ProductCancelledEvent,
  ProductCreated as ProductCreatedEvent,
  ProductDelivered as ProductDeliveredEvent,
  ProductDispatched as ProductDispatchedEvent,
  ProductDisputed as ProductDisputedEvent,
  ProductPurchased as ProductPurchasedEvent,
  ProductResolved as ProductResolvedEvent
} from "../generated/ZBay/ZBay"
import {
  OwnershipTransferred,
  ProductCancelled,
  ProductCreated,
  ProductDelivered,
  ProductDispatched,
  ProductDisputed,
  ProductPurchased,
  ProductResolved
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductCancelled(event: ProductCancelledEvent): void {
  let entity = new ProductCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ZBay_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductCreated(event: ProductCreatedEvent): void {
  let entity = new ProductCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ZBay_id = event.params.id
  entity.seller = event.params.seller
  entity.price = event.params.price
  entity.cid = event.params.cid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductDelivered(event: ProductDeliveredEvent): void {
  let entity = new ProductDelivered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ZBay_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductDispatched(event: ProductDispatchedEvent): void {
  let entity = new ProductDispatched(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ZBay_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductDisputed(event: ProductDisputedEvent): void {
  let entity = new ProductDisputed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ZBay_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductPurchased(event: ProductPurchasedEvent): void {
  let entity = new ProductPurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ZBay_id = event.params.id
  entity.buyer = event.params.buyer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductResolved(event: ProductResolvedEvent): void {
  let entity = new ProductResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ZBay_id = event.params.id
  entity.successfully = event.params.successfully

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
