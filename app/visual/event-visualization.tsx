"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

interface EventData {
  user_id: number
  story_id: number
  text: string
  annotated_text: string
  event_type: string
  event_date: string | null
  event_id: number
  coordinates: [number, number, number]
  future_ind: boolean
}

interface EventVisualizationProps {
  events: EventData[]
  onSelectEvent?: (event: EventData | null) => void
  onHoverEvent?: (event: EventData | null) => void
  selectedEventId?: number
  hoveredEventId?: number
}

export default function EventVisualization({
  events,
  onSelectEvent,
  onHoverEvent,
  selectedEventId,
  hoveredEventId,
}: EventVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rendererSize, setRendererSize] = useState({ width: 0, height: 0 })
  const [isMouseOverEvent, setIsMouseOverEvent] = useState(false)
  // Store camera and controls references to prevent re-creating the scene on hover
  const sceneRef = useRef<{
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    eventObjects?: THREE.Mesh[];
  }>({})

  useEffect(() => {
    if (!containerRef.current) return
    
    console.log("EventVisualization: Creating scene with", events.length, "events");
    console.log("Container dimensions:", containerRef.current.offsetWidth, "x", containerRef.current.offsetHeight);
    
    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current.scene = scene
    scene.background = new THREE.Color(0x0a0a12) // Slightly blue-tinted dark background
    
    // Add subtle stars to the background for depth
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    // Create random stars
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Add lighting for MeshStandardMaterial
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    // Add more lights to ensure visibility
    const pointLight2 = new THREE.PointLight(0xffffff, 0.8);
    pointLight2.position.set(0, 10, 0);
    scene.add(pointLight2);

    // Add a subtle ambient light to make everything more visible
    const ambientLightScene = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLightScene);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    sceneRef.current.camera = camera
    camera.position.z = 25 // Adjusted for better view

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    sceneRef.current.renderer = renderer
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Force correct size based on container
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    console.log("Setting renderer size to:", width, "x", height);
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    setRendererSize({
      width: width,
      height: height,
    })
    
    // Clear container and append renderer
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    console.log("Renderer DOM element appended to container");
    
    // Debug to check if the renderer element is in the DOM
    console.log("Renderer in DOM:", document.body.contains(renderer.domElement));

    // Controls setup - enable rotation
    const controls = new OrbitControls(camera, renderer.domElement)
    sceneRef.current.controls = controls
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.8
    controls.enableZoom = true
    controls.enablePan = true

    // Create event spheres only if we have events
    const eventObjects: THREE.Mesh[] = []
    sceneRef.current.eventObjects = eventObjects
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    if (events.length > 0) {
      events.forEach((event, index) => {
        // Make dots bigger for easier clicking
        // Increase size if selected or hovered
        const isActive = selectedEventId === event.event_id || hoveredEventId === event.event_id
        const size = isActive ? 2.4 : 1.6; // Doubled size for better visibility
        const geometry = new THREE.SphereGeometry(size, 32, 32)

        // Create a glowing material - color based on event type
        const getEventColor = (eventType: string) => {
          switch ((eventType || "").toLowerCase()) {
            case "education":
              return 0x70f7ff // bright blue
            case "career":
              return 0xff8f8f // bright red
            case "serendipity":
              return 0xffdf7f // bright yellow
            case "personal":
              return 0x53ffd1 // bright green
            case "social":
              return 0xa78bfa // bright purple
            default:
              return 0xffffff // white
          }
        }

        // Use MeshBasicMaterial instead of MeshStandardMaterial as it doesn't require lighting
        const material = new THREE.MeshBasicMaterial({
          color: getEventColor(event.event_type),
          transparent: true,
          opacity: isActive ? 1 : 0.95, // Increased opacity
        })

        const sphere = new THREE.Mesh(geometry, material)

        // Handle different coordinate formats
        if (Array.isArray(event.coordinates) && event.coordinates.length === 3) {
          // Use the coordinates array directly
          const x = Number(event.coordinates[0]) || 0;
          const y = Number(event.coordinates[1]) || 0; 
          const z = Number(event.coordinates[2]) || 0;
          sphere.position.set(x, y, z);
          console.log(`Sphere ${index} (with coordinates): position(${x}, ${y}, ${z})`);
        } else {
          // Use deterministic positions instead of random to avoid hydration mismatches
          // Generate positions based on event_id to be consistent
          const eventId = event.event_id || index + 1;
          const x = ((eventId * 12345) % 100) / 10 - 5; // Deterministic value between -5 and 5
          const y = ((eventId * 54321) % 100) / 10 - 5;
          const z = ((eventId * 67890) % 100) / 10 - 5;
          sphere.position.set(x, y, z);
          console.log(`Sphere ${index} (fallback): position(${x}, ${y}, ${z})`);
          console.warn("Missing coordinates for event:", event)
        }

        sphere.userData = { event }
        scene.add(sphere)
        eventObjects.push(sphere)

        // Add connecting lines between events
        if (eventObjects.length > 1) {
          const prevSphere = eventObjects[eventObjects.length - 2]
          const points = [prevSphere.position, sphere.position]
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
          
          // Make lines brighter and more visible
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x8a8a9a, // Lighter gray color
            transparent: true,
            opacity: 0.8,
            linewidth: 2 // Note: this may not work in WebGL, but we'll include it
          })
          
          const line = new THREE.Line(lineGeometry, lineMaterial)
          scene.add(line)
        }

        // Add a glow effect by creating a larger sphere behind it
        if (isActive) {
          const glowSize = size * 1.4;
          const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: getEventColor(event.event_type),
            transparent: true,
            opacity: 0.3,
          });
          const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
          glowSphere.position.copy(sphere.position);
          scene.add(glowSphere);
          
          // Store reference to glow sphere for later management
          sphere.userData.glowSphere = glowSphere;
        }
        
        // Add a pulsing effect for all spheres
        const originalScale = sphere.scale.clone();
        const pulse = {
          scale: 1.0,
          baseScale: isActive ? 1.2 : 1.0, // Store base scale (bigger for active events)
          dir: Math.random() > 0.5 ? 0.005 : -0.005, // Random starting direction
          update: () => {
            pulse.scale += pulse.dir;
            if (pulse.scale > 1.1) {
              pulse.scale = 1.1;
              pulse.dir *= -1;
            } else if (pulse.scale < 0.9) {
              pulse.scale = 0.9;
              pulse.dir *= -1;
            }
            
            // Apply the pulse effect on top of the base scale
            const pulseMultiplier = pulse.scale;
            sphere.scale.set(
              originalScale.x * pulseMultiplier * pulse.baseScale,
              originalScale.y * pulseMultiplier * pulse.baseScale,
              originalScale.z * pulseMultiplier * pulse.baseScale
            );
          }
        };
        
        // Store the pulse updater
        sphere.userData.pulse = pulse;
        
        // Initialize scale
        pulse.update();
      })
    }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
      setRendererSize({ width, height })
    }

    window.addEventListener("resize", handleResize)

    // Handle mouse click
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(eventObjects)

      if (intersects.length > 0) {
        const selectedObject = intersects[0].object
        const eventData = selectedObject.userData.event as EventData
        if (onSelectEvent) {
          onSelectEvent(eventData)
        }
      } else {
        // Only clear selection if clicking on empty space
        if (onSelectEvent) {
          onSelectEvent(null)
        }
      }
    }

    // Handle mouse move for hover effects
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !onHoverEvent) return

      const rect = containerRef.current.getBoundingClientRect()

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(eventObjects)

      if (intersects.length > 0) {
        const hoveredObject = intersects[0].object
        const eventData = hoveredObject.userData.event as EventData
        
        // Only update the hover state, don't modify camera or controls
        onHoverEvent(eventData)
        setIsMouseOverEvent(true)
      } else {
        // Only clear hover if we were previously over an event
        if (isMouseOverEvent) {
          onHoverEvent(null)
          setIsMouseOverEvent(false)
        }
      }
    }

    // Handle mouse leave to clear hover state
    const handleMouseLeave = () => {
      if (onHoverEvent && isMouseOverEvent) {
        onHoverEvent(null)
        setIsMouseOverEvent(false)
      }
    }

    containerRef.current.addEventListener("click", handleClick)
    if (onHoverEvent) {
      containerRef.current.addEventListener("mousemove", handleMouseMove)
      containerRef.current.addEventListener("mouseleave", handleMouseLeave)
    }

    // Update highlight state when selectedEventId or hoveredEventId change
    const updateHighlights = () => {
      eventObjects.forEach((obj) => {
        const eventData = obj.userData.event as EventData
        const isActive = selectedEventId === eventData.event_id || hoveredEventId === eventData.event_id
        
        // Update material appearance without changing camera position
        if (obj.material instanceof THREE.MeshBasicMaterial) {
          obj.material.opacity = isActive ? 1 : 0.95
          
          // Scale the sphere up if active, normal size if not
          const scale = isActive ? 1.2 : 1.0
          obj.scale.set(scale, scale, scale)
        }
      })
    }
    
    // Call initially and when props change
    updateHighlights()

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      // Slowly rotate the star field for a subtle animation effect
      if (stars) {
        stars.rotation.y += 0.0005;
        stars.rotation.x += 0.0002;
      }
      
      // Update all sphere pulses
      eventObjects.forEach(obj => {
        if (obj.userData.pulse) {
          obj.userData.pulse.update();
        }
      });
      
      controls.update()
      renderer.render(scene, camera)
    }

    console.log("Starting animation loop");
    animate()

    // Cleanup
    return () => {
      console.log("Cleaning up Three.js scene");
      if (containerRef.current) {
        containerRef.current.removeEventListener("click", handleClick)
        if (onHoverEvent) {
          containerRef.current.removeEventListener("mousemove", handleMouseMove)
          containerRef.current.removeEventListener("mouseleave", handleMouseLeave)
        }
        // Make sure we properly remove the renderer
        if (containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }

      window.removeEventListener("resize", handleResize)

      scene.clear()
      eventObjects.forEach((obj) => {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((material: THREE.Material) => material.dispose())
        } else {
          (obj.material as THREE.Material).dispose()
        }
        
        // Dispose glow sphere if exists
        if (obj.userData.glowSphere) {
          const glowSphere = obj.userData.glowSphere;
          glowSphere.geometry.dispose();
          if (glowSphere.material instanceof THREE.Material) {
            glowSphere.material.dispose();
          }
        }
      })
      
      // Clear our refs
      sceneRef.current = {}
    }
  }, [events]) // Only rebuild scene when events change, NOT when selectedEventId or hoveredEventId change

  // New effect to update highlights without recreating the scene
  useEffect(() => {
    const { eventObjects, scene, renderer, camera } = sceneRef.current;
    if (!eventObjects || !scene || !renderer || !camera) return;
    
    console.log("Updating highlights for selectedId:", selectedEventId, "hoveredId:", hoveredEventId);
    
    // Update each object's appearance based on selection state
    eventObjects.forEach((obj) => {
      const eventData = obj.userData.event as EventData;
      const isActive = selectedEventId === eventData.event_id || hoveredEventId === eventData.event_id;
      
      // Update material
      if (obj.material instanceof THREE.MeshBasicMaterial) {
        obj.material.opacity = isActive ? 1 : 0.95;
      }
      
      // Update pulse base scale without disrupting the animation
      if (obj.userData.pulse) {
        obj.userData.pulse.baseScale = isActive ? 1.2 : 1.0;
        
        // Force an update to the scale immediately
        obj.userData.pulse.update();
      }
      
      // Handle glow effect
      const getEventColor = (eventType: string) => {
        switch ((eventType || "").toLowerCase()) {
          case "education":
            return 0x70f7ff // bright blue
          case "career":
            return 0xff8f8f // bright red
          case "serendipity":
            return 0xffdf7f // bright yellow
          case "personal":
            return 0x53ffd1 // bright green
          case "social":
            return 0xa78bfa // bright purple
          default:
            return 0xffffff // white
        }
      }
      
      // Remove existing glow sphere if there is one
      if (obj.userData.glowSphere) {
        scene.remove(obj.userData.glowSphere);
        obj.userData.glowSphere = null;
      }
      
      // Add glow effect for active objects
      if (isActive) {
        const size = isActive ? 2.4 : 1.6;
        const glowSize = size * 1.4;
        const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: getEventColor(eventData.event_type),
          transparent: true,
          opacity: 0.3,
        });
        const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        glowSphere.position.copy(obj.position);
        scene.add(glowSphere);
        
        // Store reference to new glow sphere
        obj.userData.glowSphere = glowSphere;
      }
    });
    
    // Render one frame to update the visuals
    renderer.render(scene, camera);
    
  }, [selectedEventId, hoveredEventId]);

  return (
    <div className="relative h-full w-full">
      {/* Red background removed now that visualization is working */}
      <div ref={containerRef} className="h-full w-full" />

      {events.length === 0 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#ffffff]/70">
          <p>no events to display</p>
        </div>
      )}
    </div>
  )
}

