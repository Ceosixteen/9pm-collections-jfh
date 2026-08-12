import React from 'react';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  return (
    <section id="reviews" className="py-16 bg-[#FAF8FC] border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-xs font-extrabold uppercase tracking-wider border border-purple-200">
            VERIFIED JUBA CUSTOMER REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
            Loved Across Juba Town
          </h2>
          <p className="text-sm text-slate-600 font-normal">
            Real reviews from customers in Munuki, Tongping, Hai Cinema, Custom Market, Gudele, and Thongpiny.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white border border-gray-100 flex flex-col justify-between space-y-4 shadow-md hover:shadow-xl hover:border-purple-200 transition-all duration-300"
            >
              <div className="space-y-3">
                {/* Stars & Verified */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Order
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                  "{rev.quote}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{rev.name}</span>
                  <span className="text-gray-500 flex items-center gap-1 text-[10px]">
                    <MapPin className="w-3 h-3 text-[#B24BF3]" />
                    {rev.location}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#B24BF3] font-bold block">{rev.favoritePerfume}</span>
                  <span className="text-[10px] text-gray-400">{rev.date}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
