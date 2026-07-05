import React from 'react';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Footer() {
  const { currentDict } = useTranslation();

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-12 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & Intro */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-brand-green text-white p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
              </span>
              <span className="font-extrabold text-xl tracking-tight">UG Bazaar</span>
            </div>
            <p className="text-sm text-brand-muted font-medium leading-relaxed">
              {currentDict.footer.introText}
            </p>
          </div>

          {/* Hyperlocal Coverage */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-brand-yellow tracking-wider uppercase">
              {currentDict.footer.coverageTitle}
            </h4>
            <ul className="text-sm text-brand-muted space-y-2.5 font-medium">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span>{currentDict.footer.talodhi}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span>{currentDict.footer.bhangaram}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span>{currentDict.footer.district}</span>
              </li>
            </ul>
          </div>

          {/* Business Timings */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-brand-yellow tracking-wider uppercase">
              {currentDict.footer.detailsTitle}
            </h4>
            <ul className="text-sm text-brand-muted space-y-2.5 font-medium">
              <li>
                <span className="block text-white font-bold text-xs uppercase">
                  Timings
                </span>
                <span>{currentDict.footer.timings}</span>
              </li>
              <li>
                <span className="block text-white font-bold text-xs uppercase">
                  {currentDict.cart.deliveryCharge}
                </span>
                <span>{currentDict.footer.freeDelivery}</span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-brand-yellow tracking-wider uppercase">
              {currentDict.footer.supportTitle}
            </h4>
            <ul className="text-sm text-brand-muted space-y-2.5 font-medium">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-green" />
                <span>{currentDict.footer.supportPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-green" />
                <span>{currentDict.footer.supportEmail}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-muted font-medium">
            © {new Date().getFullYear()} {currentDict.footer.copyright}
          </p>
          <div className="flex items-center gap-4 text-xs text-brand-muted font-bold">
            <span className="bg-white/5 px-2.5 py-1 rounded-md">Razorpay SECURE</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md">BHIM UPI APPROVED</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md">ISO 9001:2015</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
