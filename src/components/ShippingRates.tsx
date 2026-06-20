import React from 'react';

export default function ShippingRates() {
  return (
    <div className="bg-[#000000] text-[#A0A0AB] font-body space-y-8">
      {/* Canadian Customers */}
      <section>
        <h3 className="font-heading font-extrabold text-[#FFFFFF] text-lg uppercase tracking-wider mb-4">
          Canadian Customers
        </h3>
        <ul className="space-y-3 list-disc pl-5 marker:text-[#0066FF]">
          <li>
            <strong className="text-[#FFFFFF]">Standard Orders:</strong> $20 CAD flat rate (Free shipping on orders over $1000 CAD).
          </li>
          <li>
            <strong className="text-[#FFFFFF]">Exhaust Systems:</strong> $80 CAD flat rate for Full Systems; $65 CAD for Delete Pipes.
          </li>
          <li>
            <strong className="text-[#FFFFFF]">Bulk Orders:</strong> 10 or more exhaust pieces ship via skid freight at no cost.
          </li>
          <li>
            <strong className="text-[#FFFFFF]">Remote Locations:</strong> Flat rate and free shipping may not apply. We will contact you prior to fulfillment with an adjusted freight quote.
          </li>
        </ul>
      </section>

      {/* North American (US) Customers */}
      <section>
        <h3 className="font-heading font-extrabold text-[#FFFFFF] text-lg uppercase tracking-wider mb-4">
          North American (US) Customers
        </h3>
        <ul className="space-y-3 list-disc pl-5 marker:text-[#0066FF]">
          <li>
            <strong className="text-[#FFFFFF]">Standard Orders:</strong> $37 USD flat rate.
          </li>
          <li>
            <strong className="text-[#FFFFFF]">Exhaust Systems:</strong> $111 USD flat rate for Full Systems; $74 USD for Delete Pipes.
          </li>
          <li>
            <strong className="text-[#FFFFFF]">Bulk Orders:</strong> 10 or more exhaust pieces ship via skid freight ($500 USD first skid, $250 USD each additional).
          </li>
          <li>
            <strong className="text-[#FFFFFF]">Remote Locations:</strong> Subject to manual freight adjustments prior to fulfillment.
          </li>
        </ul>
      </section>

      {/* International Duties & Tariffs */}
      <section>
        <h3 className="font-heading font-extrabold text-[#FFFFFF] text-lg uppercase tracking-wider mb-4">
          International Duties & Tariffs
        </h3>
        <p className="leading-relaxed">
          Shipments outside of Canada may incur <strong className="text-[#FFFFFF]">TARIFFS</strong> and <strong className="text-[#FFFFFF]">TAXES</strong> based on the destination. As a Canadian entity, THE LAB only collects taxes within Canada. All cross-border import duties are the sole responsibility of the consumer and cannot be calculated by THE LAB prior to shipping.
        </p>
      </section>
    </div>
  );
}
