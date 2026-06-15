import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import { imageCatalog, resolveImageSrc } from '@/lib/imageCatalog';

export default function TShirtsCategoryPage() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'classic-tees',
      title: 'Classic Tees',
      description: 'Timeless essentials in premium cotton with iconic branding',
      handle: 'classic-tees',
      image: 'src/images/Classic GIOVANNI T-shirts in black.png',
      icon: 'C',
    },
    {
      id: 'core-tees',
      title: 'Core Tees',
      description: 'The foundation of luxury casual wear with refined simplicity',
      handle: 'core-tees',
      image: 'src/images/Crisp white T-shirt with _GIOVANNI_ print.png',
      icon: 'CR',
    },
    {
      id: 'signature-tees',
      title: 'Signature Tees',
      description: 'Premium signature collection with elevated craftsmanship',
      handle: 'signature-tees',
      image: 'src/images/Classic Giovanni T-shirts in sage.png',
      icon: 'S',
    },
  ];

  const handleCategoryClick = (handle: string) => {
    navigate(`/collections/t-shirts/${handle.replace('-tees', '')}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      {/* Title Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-8">
        <div className="text-center">
          <h1 className="font-heading text-4xl lg:text-5xl tracking-[0.05em] font-light text-[#1A1A1A] mb-4">
            T-SHIRTS COLLECTION
          </h1>
          <p className="text-base lg:text-lg text-[#666666] font-light max-w-2xl mx-auto leading-relaxed">
            Explore our curated range of premium tees. Each collection represents a distinct philosophy of casual luxury.
          </p>
        </div>
      </div>

      {/* Cards Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-[1050px] grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.handle)}
                className="group relative w-full max-w-sm h-[440px] overflow-hidden rounded-md transition-all duration-500 cursor-pointer hover:shadow-lg"
              >
                {/* Background Image */}
                <img
                  src={resolveImageSrc(category.image)}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* SET Label - only for Signature Tees */}
                {category.id === 'signature-tees' && (
                  <div className="absolute top-0 right-0 m-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-[9px] tracking-[0.2em] uppercase font-medium text-[#1A1A1A]">SET</span>
                  </div>
                )}

                {/* Overlay - reduced opacity for luxury feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/50 group-hover:via-black/25" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                  <div className="space-y-2 transform transition-transform duration-500">
                    <h2 className="font-heading text-xl lg:text-2xl tracking-[0.03em] font-light text-white">
                      {category.title}
                    </h2>

                    <p className="text-xs lg:text-sm text-white/80 font-light leading-relaxed line-clamp-2">
                      {category.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[9px] lg:text-[10px] tracking-[0.2em] uppercase font-light text-white/90">
                        View
                      </span>
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-500 group-hover:translate-x-0.5 opacity-90"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtle hover line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Features Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20 border-t border-[#E8E8E8]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <h3 className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#1A1A1A] mb-2">
              Premium Quality
            </h3>
            <p className="text-sm text-[#666666] font-light">
              Crafted from the finest materials for luxury and durability
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#1A1A1A] mb-2">
              Timeless Design
            </h3>
            <p className="text-sm text-[#666666] font-light">
              Modern aesthetics that transcend seasonal trends
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#1A1A1A] mb-2">
              Sustainability
            </h3>
            <p className="text-sm text-[#666666] font-light">
              Responsibly sourced and ethically produced pieces
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
