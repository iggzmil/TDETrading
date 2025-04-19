// Define SimpleCounter class globally
class SimpleCounter {
	constructor(element, options = {}) {
		this.element = element;
		this.startValue = 0;
		this.endValue = parseFloat(element.textContent.replace(/[^\d.-]/g, ''));
		this.duration = options.duration || 3000;
		this.delay = options.delay || 0;
		this.decimals = this.getDecimalPlaces(this.endValue);
		this.suffix = this.getSuffix(element.textContent);
	}

	getDecimalPlaces(num) {
		const decimalStr = num.toString().split('.')[1];
		return decimalStr ? decimalStr.length : 0;
	}

	getSuffix(text) {
		const match = text.match(/[^\d.-]+$/);
		return match ? match[0] : '';
	}

	formatNumber(num) {
		const formatted = num.toFixed(this.decimals);
		return this.decimals > 0 ? formatted.replace(/\.?0+$/, '') : formatted;
	}

	animate() {
		const startTime = performance.now();
		const updateCount = (currentTime) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / this.duration, 1);

			const currentValue = this.startValue + (this.endValue - this.startValue) * progress;
			this.element.textContent = this.formatNumber(currentValue) + this.suffix;

			if (progress < 1) {
				requestAnimationFrame(updateCount);
			}
		};

		setTimeout(() => {
			requestAnimationFrame(updateCount);
		}, this.delay);
	}
}

(function ($) {
    "use strict";

	var $window = $(window);
	var $body = $('body');

	/* Preloader Effect with Animation Initialization */
	$window.on('load', function(){
		// Fade out preloader
		$(".preloader").fadeOut(600);

		// Ensure animations are initialized after page is fully loaded
		setTimeout(function() {
			if (typeof window.refreshAnimations === 'function') {
				window.refreshAnimations();
			}
		}, 100);
	});

	/* Sticky Header */
	if($('.active-sticky-header').length){
		$window.on('resize', function(){
			setHeaderHeight();
		});

		function setHeaderHeight(){
	 		$("header.main-header").css("height", $('header .header-sticky').outerHeight());
		}

		$window.on("scroll", function() {
			var fromTop = $(window).scrollTop();
			setHeaderHeight();
			var headerHeight = $('header .header-sticky').outerHeight()
			$("header .header-sticky").toggleClass("hide", (fromTop > headerHeight + 100));
			$("header .header-sticky").toggleClass("active", (fromTop > 600));
		});
	}

	/* Slick Menu JS removed - desktop-only site */

	if($("a[href='#top']").length){
		$(document).on("click", "a[href='#top']", function() {
			$("html, body").animate({ scrollTop: 0 }, "slow");
			return false;
		});
	}

	/* Typed subtitle */
	if ($('.typed-title').length) {
		$('.typed-title').typed({
			stringsElement: $('.typing-title'),
			backDelay: 2000,
			typeSpeed: 0,
			loop: true
		});
	}

	/**
	 * Hero Slider Initialization
	 * Sets up the main hero slider with navigation and autoplay
	 */
	if ($('.hero-slider-layout').length) {
		// Function to dynamically generate the hero slider
		function initHeroSlider() {
			// Slider image data
			const sliderImages = [
				{ src: 'images/slider/hero-bg-s1.webp', alt: 'TDE Trading' },
				{ src: 'images/slider/hero-bg-s2.webp', alt: 'TDE Trading' },
				{ src: 'images/slider/hero-bg-s3.webp', alt: 'TDE Trading' },
				{ src: 'images/slider/hero-bg-s4.webp', alt: 'TDE Trading' },
				{ src: 'images/slider/hero-bg-s5.webp', alt: 'TDE Trading' },
				{ src: 'images/slider/hero-bg-s6.webp', alt: 'TDE Trading' },
				{ src: 'images/slider/hero-bg-s7.webp', alt: 'TDE Trading' }
			];

			// Fisher-Yates shuffle algorithm for better randomization
			function shuffleArray(array) {
				const shuffled = [...array];
				for (let i = shuffled.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
				}
				return shuffled;
			}

			// Randomize the slider images
			const randomizedImages = shuffleArray(sliderImages);

			// Create the slider structure
			const sliderContainer = $('<div class="swiper"></div>');
			const swiperWrapper = $('<div class="swiper-wrapper"></div>');

			// Generate slides
			randomizedImages.forEach(image => {
				const slide = $('<div class="swiper-slide"></div>');
				const heroSlide = $('<div class="hero-slide"></div>');

				// Add slider image
				const heroSliderImage = $('<div class="hero-slider-image"></div>');
				heroSliderImage.append($('<img>').attr({
					src: image.src,
					alt: image.alt
				}));
				heroSlide.append(heroSliderImage);

				// Add content container
				const container = $('<div class="container"></div>');
				const row = $('<div class="row align-items-center"></div>');
				const col = $('<div class="col-lg-12"></div>');

				// Hero content
				const heroContent = $('<div class="hero-content"></div>');

				// Section title
				const sectionTitle = $('<div class="section-title dark-section"></div>');
				sectionTitle.append($('<h3 class="fadeInUp">WELCOME TO TDE TRADING</h3>'));
				sectionTitle.append($('<h1 class="text-anime-style-2" data-cursor="-opaque">Your Edge in the Markets <span>Starts Here!</span></h1>'));
				sectionTitle.append($('<p class="fadeInUp" data-delay="0.2s">We equip traders with proven strategies, sharp market insights, and realevant tools to grow with confidence and build consistent results — step by step.</p>'));

				// Hero content body
				const heroContentBody = $('<div class="hero-content-body fadeInUp" data-delay="0.4s"></div>');
				const heroBtn = $('<div class="hero-btn"></div>');
				heroBtn.append($('<a href="pricing.html" class="btn-default">get started</a>'));

				// Assemble the DOM structure
				heroContentBody.append(heroBtn);
				heroContent.append(sectionTitle);
				heroContent.append(heroContentBody);
				col.append(heroContent);
				row.append(col);
				container.append(row);
				heroSlide.append(container);
				slide.append(heroSlide);
				swiperWrapper.append(slide);
			});

			// Add pagination
			const pagination = $('<div class="hero-pagination"></div>');

			// Assemble the slider
			sliderContainer.append(swiperWrapper);
			$('.hero-slider-layout').append(sliderContainer);
			$('.hero-slider-layout').append(pagination);

			// Initialize the swiper
			return new Swiper('.hero-slider-layout .swiper', {
				slidesPerView: 1,
				speed: 1000,
				spaceBetween: 0,
				loop: true,
				autoplay: {
					delay: 6000,
					disableOnInteraction: false
				},
				pagination: {
					el: '.hero-pagination',
					clickable: true
				},
				effect: 'slide',
				direction: 'horizontal'
			});
		}

		// Initialize the slider
		initHeroSlider();
	}

	/* Hero Client Slider JS */
	if ($('.hero-client-slider').length) {
		const testimonial_company_slider = new Swiper('.hero-client-slider .swiper', {
			slidesPerView : 3,
			speed: 2000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
			},
			// Desktop-only site - no breakpoints
		});
	}

	/* Feature Partner Slider JS */
	if ($('.feature-partner-slider').length) {
		const feature_partner_slider = new Swiper('.feature-partner-slider .swiper', {
			slidesPerView : 3,
			speed: 2000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
			},
			// Desktop-only site - no breakpoints
		});
	}

	/* testimonial Slider JS */
	if ($('.testimonial-slider').length) {
		const testimonial_slider = new Swiper('.testimonial-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
			},
			pagination: {
				el: '.testimonial-pagination',
				clickable: true,
			},
			navigation: {
				nextEl: '.testimonial-button-next',
				prevEl: '.testimonial-button-prev',
			},
			// Desktop-only site - no breakpoints
		});
	}

	/* Skill Bar - GSAP Optimized */
	if ($('.skills-progress-bar').length) {
		// Initialize GSAP if not already done
		if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
			// Create a single ScrollTrigger for all skill bars (better performance)
			ScrollTrigger.create({
				trigger: '.skills-progress-bar',
				start: 'top 75%', // Trigger earlier for better UX
				onEnter: function() {
					// Batch all animations together for better performance
					gsap.to('.skillbar .count-bar', {
						width: function() {
							// Get the target width from the data-percent attribute
							return $(this).closest('.skillbar').attr('data-percent');
						},
						duration: 0.8, // Reduced from 2s for better UX
						ease: 'power2.out', // Smoother easing
						stagger: 0.1, // Stagger each animation by 0.1s
						overwrite: true // Prevent animation conflicts
					});
				},
				once: true // Only trigger once
			});
		} else {
			// Fallback to jQuery animation if GSAP is not available
			$('.skills-progress-bar').waypoint(function() {
				$('.skillbar').each(function() {
					$(this).find('.count-bar').animate({
						width: $(this).attr('data-percent')
					}, 1000); // Reduced from 2000ms
				});
			}, {
				offset: '75%' // Trigger earlier
			});
		}
	}

	/* Init Counter */
	if (document.querySelector('.counter')) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const counter = new SimpleCounter(entry.target, {
						duration: 3000,
						delay: 0
					});
					counter.animate();
					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: 0.5
		});

		document.querySelectorAll('.counter').forEach(el => {
			observer.observe(el);
		});
	}

	/* Image Reveal Animation */
	if ($('.reveal').length) {
		gsap.registerPlugin(ScrollTrigger);
		let revealContainers = document.querySelectorAll(".reveal");
		revealContainers.forEach((container) => {
			let image = container.querySelector("img");
			let delay = container.getAttribute('data-delay') || 0;
			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: container,
					toggleActions: "play none none none"
				}
			});
			tl.set(container, {
				autoAlpha: 1
			});
			tl.from(container, 1, {
				xPercent: -100,
				ease: Power2.out,
				delay: delay
			});
			tl.from(image, 1, {
				xPercent: 100,
				scale: 1,
				delay: -1,
				ease: Power2.out
			});
		});
	}

	/* Text Effect Animation */
	if ($('.text-anime-style-1').length) {
		let staggerAmount 	= 0.05,
			translateXValue = 0,
			delayValue 		= 0.5,
		   animatedTextElements = document.querySelectorAll('.text-anime-style-1');

		if (animatedTextElements.length > 0) {
			animatedTextElements.forEach((element) => {
				let animationSplitText = new SplitText(element, { type: "chars, words" });
					gsap.from(animationSplitText.words, {
					duration: 1,
					delay: delayValue,
					x: 20,
					autoAlpha: 0,
					stagger: staggerAmount,
					scrollTrigger: { trigger: element, start: "top 85%" },
					});
			});
		}
	}

	if ($('.text-anime-style-2').length) {
		let	staggerAmount 		= 0.03,
			translateXValue	= 20,
			delayValue 		= 0.1,
			easeType 			= "power2.out",
			animatedTextElements = document.querySelectorAll('.text-anime-style-2');

		if (animatedTextElements.length > 0) {
			animatedTextElements.forEach((element) => {
				let animationSplitText = new SplitText(element, { type: "chars, words" });
					gsap.from(animationSplitText.chars, {
						duration: 1,
						delay: delayValue,
						x: translateXValue,
						autoAlpha: 0,
						stagger: staggerAmount,
						ease: easeType,
						scrollTrigger: { trigger: element, start: "top 85%"},
					});
			});
		}
	}

	if ($('.text-anime-style-2').length) {
		let	animatedTextElements = document.querySelectorAll('.text-anime-style-2');

		 animatedTextElements.forEach((element) => {
			//Reset if needed
			if (element.animation) {
				element.animation.progress(1).kill();
				element.split.revert();
			}

			element.split = new SplitText(element, {
				type: "lines,words,chars",
				linesClass: "split-line",
			});
			gsap.set(element, { perspective: 400 });

			gsap.set(element.split.chars, {
				opacity: 0,
				x: "50",
			});

			element.animation = gsap.to(element.split.chars, {
				scrollTrigger: { trigger: element,	start: "top 90%" },
				x: "0",
				y: "0",
				rotateX: "0",
				opacity: 1,
				duration: 1,
				ease: Back.easeOut,
				stagger: 0.02,
			});
		});
	}

	/* Parallaxie js - removed for desktop-only site */

	/* Zoom Gallery screenshot */
	if ($('.gallery-items').length && typeof $.fn.magnificPopup !== 'undefined') {
		$('.gallery-items').magnificPopup({
			delegate: 'a',
			type: 'image',
			closeOnContentClick: false,
			closeBtnInside: false,
			mainClass: 'mfp-with-zoom',
			image: {
				verticalFit: true,
			},
			gallery: {
				enabled: true
			},
			zoom: {
				enabled: true,
				duration: 300, // don't foget to change the duration also in CSS
				opener: function(element) {
				  return element.find('img');
				}
			}
		});
	}

	/* Contact form validation */
	// Form handling has been moved to form-handler.js

	/* Animated Scroll Animations with GSAP ScrollTrigger */
	// Animation initialization is handled in scrollAnimations.js

	/* Popup Video */
	if ($('.popup-video').length && typeof $.fn.magnificPopup !== 'undefined') {
		$('.popup-video').magnificPopup({
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: true
		});
	}

	/* Our Services List Active Start */
	if ($('.our-service-list').length) {
		var element = $('.our-service-list');
		var items = element.find('.service-item');
		if (items.length) {
			items.on({
				mouseenter: function() {
					if($(this).hasClass('active')) return;

					items.removeClass('active');
					$(this).addClass('active');

				},
				mouseleave: function() {
					//stuff to do on mouse leave
				}
			});
		}
	}
	/* Our Services List Active End */

	/* Back to Top Button */
	const backToTop = $('.back-to-top');

	$window.on('scroll', function() {
		if ($window.scrollTop() > 300) {
			backToTop.addClass('show');
		} else {
			backToTop.removeClass('show');
		}
	});

	backToTop.on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: 0}, 'slow');
		return false;
	});

	/*  Footer Logo Back to Top Script (Only for index page) */

        document.addEventListener('DOMContentLoaded', function() {
            // This script only runs on index.html
            const footerLogo = document.getElementById('footer-logo-top');
            if (footerLogo) {
                footerLogo.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }

            // Initialize back to top and chat icon functionality
            initBackToTop();
            initChatIcon();
        });

})(jQuery);

// Back to Top and Chat Icon Functionality (Integrated from back-to-top.js)
// Add the CSS styles to the document
(function() {
    const style = document.createElement('style');
    style.textContent = `
        #backToTopBtn {
            position: fixed;
            bottom: 20px;
            right: 80px; /* Move to the left of chat icon */
            width: 40px;
            height: 40px;
            background-color: #00CC61;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9998;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            font-size: 20px;
            font-weight: bold;
        }
        #backToTopBtn:hover {
            background-color: #00b355;
            transform: translateY(-2px);
        }
        #backToTopBtn.visible {
            opacity: 1;
            visibility: visible;
        }
        #chatIconBtn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background-color: #00CC61;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9998;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            font-size: 20px;
        }
        #chatIconBtn:hover {
            background-color: #00b355;
            transform: translateY(-2px);
        }
        #chatIconText {
            position: absolute;
            top: -60px;
            right: 0px;
            background-color: #fff;
            color: #333;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            opacity: 1;
            visibility: visible;
            transition: all 0.3s ease;
        }
        #chatIconText::after {
            content: '';
            position: absolute;
            bottom: -8px;
            right: 15px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #fff;
            filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
        }
        .contact-page #chatIconBtn {
            display: none; /* Hide on contact page */
        }
        .contact-page #backToTopBtn {
            right: 370px; /* Position even further to the left of the wide chat widget */
            bottom: 20px;
            z-index: 9998; /* Ensure it's visible but below the chat widget */
        }
        /* Desktop-only site - no mobile media queries */
    `;
    document.head.appendChild(style);
})();

// Initialize back to top functionality
function initBackToTop() {
    // Create the button if it doesn't exist
    if (!document.getElementById('backToTopBtn')) {
        const button = document.createElement('button');
        button.id = 'backToTopBtn';
        button.title = 'Go to top';
        button.textContent = '↑';
        document.body.appendChild(button);
    }

    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Smooth scroll to top when button is clicked
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Force initial check of scroll position
        window.dispatchEvent(new Event('scroll'));
    }
}

// Initialize chat icon functionality
function initChatIcon() {
    // Don't create the chat icon on contact page
    if (document.body.classList.contains('contact-page')) {
        return;
    }

    // Create the button if it doesn't exist
    if (!document.getElementById('chatIconBtn')) {
        const button = document.createElement('a');
        button.id = 'chatIconBtn';
        button.title = 'Chat with us';
        button.href = 'contact.html?openChat=true';

        // Create text bubble
        const textBubble = document.createElement('span');
        textBubble.id = 'chatIconText';
        textBubble.textContent = 'Hey 👋 Need help? Let\'s chat!';
        button.appendChild(textBubble);

        // Create icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-comment';
        button.appendChild(icon);

        document.body.appendChild(button);
    }
}