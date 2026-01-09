import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Leaf } from 'lucide-react';
import nutritionistPhoto from '../assets/nutritionist.jpg';

const Hero = ({ onStartSurvey }) => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-nutritionist-dark text-white pt-20 pb-12">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-white blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-nutritionist-light blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <Leaf className="w-4 h-4 text-nutritionist-light" />
                            <span className="text-sm font-semibold tracking-wider uppercase">Ольга Жегалина</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                            Ваш путь к <span className="text-nutritionist-light">здоровому</span> <br />телу и энергии
                        </h1>

                        <p className="max-w-xl text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-light">
                            Профессиональный нутрициолог поможет вам разобраться с питанием,
                            улучшить самочувствие и достичь желаемых результатов без жестких ограничений.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => onStartSurvey('adult')}
                                className="px-8 py-4 bg-nutritionist-light hover:bg-nutritionist-medium text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-nutritionist-light/20 flex items-center justify-center gap-2"
                            >
                                Анкета для взрослых
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onStartSurvey('child')}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-lg backdrop-blur-md border border-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Анкета для детей
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 aspect-[4/5] max-w-md mx-auto">
                            <img
                                src={nutritionistPhoto}
                                alt="Нутрициолог Ольга Жегалина"
                                className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-nutritionist-dark/60 via-transparent to-transparent opacity-60" />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-nutritionist-light/20 blur-2xl rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-nutritionist-medium/20 blur-3xl rounded-full" />
                    </motion.div>

                    {/* Mobile image version */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="lg:hidden mt-8 max-w-xs mx-auto"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 aspect-square">
                            <img
                                src={nutritionistPhoto}
                                alt="Ольга Жегалина"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
            >
                <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
            </motion.div>
        </section>
    );
};

export default Hero;
