-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
