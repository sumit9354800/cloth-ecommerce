'use client';

import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-dark dark:to-dark">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <div className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full animate-bounce">
              🎉 New Collection 2024
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Discover Your
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Perfect Style
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
              Premium clothing for every occasion. From casual wear to formal attire, 
              find everything you need to express your unique style.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                Shop Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href="/products?category=Women"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-full hover:border-primary hover:text-primary transition-all"
              >
                View Collection
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-gray-600 dark:text-gray-400">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">1000+</p>
                <p className="text-gray-600 dark:text-gray-400">Products</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">4.8</p>
                <p className="text-gray-600 dark:text-gray-400">Rating</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Image/Illustration */}
          <div className="relative hidden md:block">
            <div className="relative">
              {/* Placeholder for hero image */}
              <div className="w-full aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-9xl">👗</span>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-4">
                    Premium Collection
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-10 right-10 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl rotate-6 animate-float">
              <p className="text-sm font-semibold text-primary">🔥 Hot Deal</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Up to 50% Off</p>
            </div>
            
            <div className="absolute bottom-10 left-10 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl -rotate-6 animate-float-delayed">
              <p className="text-sm font-semibold text-secondary">🚚 Free Shipping</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">On Orders ₹999+</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;