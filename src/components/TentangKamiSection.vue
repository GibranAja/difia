<template>
  <section class="tentang-kami-section" id="about">
    <!-- About Content -->
    <div class="about-container">
      <div class="about-background">
        <div class="bg-pattern bg-pattern-1"></div>
        <div class="bg-pattern bg-pattern-2"></div>
      </div>

      <div class="about-content">
        <!-- Left column with image -->
        <div class="about-visual">
          <div class="image-container">
            <div class="image-decorations">
              <span class="decoration dec-circle"></span>
              <span class="decoration dec-square"></span>
              <span class="decoration dec-dots"></span>
            </div>
            <div class="image-frame">
              <img src="../assets/Logo Difia Haki.PNG" alt="Difia Logo" class="about-image" />
            </div>
          </div>
        </div>

        <!-- Right column with text -->
        <div class="about-text">
          <div class="text-header">
            <h2 class="section-title">TENTANG KAMI</h2>
            <div class="title-underline"></div>
          </div>

          <div class="text-content">
            <p>
              Difia sebuah brand lokal yang berdiri sejak 20 Agustus 2020. Pada saat Puncak pandemi
              covid-19, Perusahaan ini berbasis perorangan tergolong UMKM Home Industry di bidang
              fashion berbahan baku kulit sintetis diolah menjadi sendal dan tas terletak di kota
              Bogor
            </p>

            <div class="about-features">
              <div class="feature">
                <span class="feature-icon">
                  <i class="fas fa-star"></i>
                </span>
                <span class="feature-text">Kualitas Premium</span>
              </div>
              <div class="feature">
                <span class="feature-icon">
                  <i class="fas fa-heart"></i>
                </span>
                <span class="feature-text">Dibuat dengan Cinta</span>
              </div>
              <div class="feature">
                <span class="feature-icon">
                  <i class="fas fa-check"></i>
                </span>
                <span class="feature-text">100% Lokal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear container for achievement section -->
    <div class="achievement-wrapper">
      <AchievementSection />
    </div>
  </section>
</template>

<script setup>
import AchievementSection from '@/components/AchievementSection.vue'
</script>

<style scoped>
/* Main section styling */
.tentang-kami-section {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

/* Container with background patterns */
.about-container {
  position: relative;
  padding: 6rem 2rem;
  overflow: hidden;
  margin-bottom: 3rem; /* Add space between about and achievement sections */
}

.about-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg-pattern {
  position: absolute;
  opacity: 0.05;
}

.bg-pattern-1 {
  width: 300px;
  height: 300px;
  border: 25px solid #02163b;
  border-radius: 50%;
  top: -100px;
  left: -100px;
}

.bg-pattern-2 {
  width: 200px;
  height: 200px;
  background: #e8ba38;
  bottom: -50px;
  right: -50px;
  transform: rotate(45deg);
}

/* Content layout */
.about-content {
  position: relative;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 5rem;
  z-index: 2;
}

/* Left column - Visual */
.about-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.image-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.decoration {
  position: absolute;
}

.dec-circle {
  width: 120px;
  height: 120px;
  border: 8px solid #e8ba38;
  border-radius: 50%;
  top: -30px;
  left: -30px;
}

.dec-square {
  width: 100px;
  height: 100px;
  background-color: #02163b;
  bottom: -20px;
  right: -20px;
  z-index: 0;
}

.dec-dots {
  width: 80px;
  height: 80px;
  background-image: radial-gradient(#02163b 2px, transparent 2px);
  background-size: 10px 10px;
  top: 50%;
  right: -40px;
}

.image-frame {
  position: relative;
  background-color: white;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 2;
}

.about-image {
  width: 100%;
  height: auto;
  display: block;
  max-width: 300px;
}

/* Right column - Text */
.about-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text-header {
  margin-bottom: 1.5rem;
  position: relative;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #02163b;
  margin: 0 0 0.5rem 0;
}

.title-underline {
  width: 80px;
  height: 4px;
  background-color: #e8ba38;
  margin-bottom: 1.5rem;
}

.text-content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #444;
}

.about-features {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border-radius: 50px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  width: 30px;
  height: 30px;
  background-color: #e8ba38;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feature-text {
  font-weight: 600;
  color: #02163b;
}

/* Achievement wrapper to ensure proper spacing */
.achievement-wrapper {
  position: relative;
  width: 100%;
  z-index: 3; /* Ensure achievement section is on top */
  margin-top: 2rem; /* More spacing between sections */
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .about-content {
    flex-direction: column;
    gap: 3rem;
  }

  .image-container {
    margin: 0 auto;
  }

  .section-title {
    text-align: center;
    font-size: 2.2rem;
  }

  .title-underline {
    margin: 0 auto 1.5rem;
  }

  .text-content {
    text-align: center;
  }

  .about-features {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 4rem 1.5rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .about-features {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  /* Keep these styles for achievement section compatibility */
  .swipper p {
    position: static;
    transform: rotate(0);
    margin-bottom: 1.5rem;
    color: #02163b;
    text-align: center;
    width: 100%;
    left: auto;
    font-weight: bold;
    font-size: 1.8rem;
    display: block;
  }

  .swipper {
    justify-content: center;
    flex-direction: column;
    padding: 0 15px;
  }
}

@media (max-width: 576px) {
  .dec-circle,
  .dec-square {
    width: 70px;
    height: 70px;
  }

  .dec-dots {
    display: none;
  }

  /* Keep these for achievement section */
  .swipper .bg-scroll,
  .swipper .side-color,
  .swipper .ring {
    display: none;
  }
}
</style>
