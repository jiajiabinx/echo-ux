"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

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
  x?: number
  y?: number
  z?: number
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

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0c0c0c)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 15

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    setRendererSize({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })
    containerRef.current.appendChild(renderer.domElement)

    // Controls setup - enable rotation
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.8
    controls.enableZoom = true
    controls.enablePan = true

    // Create event spheres only if we have events
    const eventObjects: THREE.Mesh[] = []
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    if (events.length > 0) {
      events.forEach((event) => {
        // Make dots bigger for easier clicking
        // Increase size if selected or hovered
        const isActive = selectedEventId === event.event_id || hoveredEventId === event.event_id
        const size = isActive ? 0.9 : 0.6
        const geometry = new THREE.SphereGeometry(size, 32, 32)

        // Create a glowing material - color based on event type
        const getEventColor = (eventType: string) => {
          switch ((eventType || "").toLowerCase()) {
            case "serendipity":
              return 0x48dbfb // blue
            case "milestone":
              return 0xff6b6b // red
            case "challenge":
              return 0xfeca57 // yellow
            case "achievement":
              return 0x1dd1a1 // green
            default:
              return 0xffffff // white
          }
        }

        const material = new THREE.MeshBasicMaterial({
          color: getEventColor(event.event_type),
          transparent: true,
          opacity: isActive ? 1 : 0.8,
          emissive: getEventColor(event.event_type),
          emissiveIntensity: isActive ? 1.8 : 1,
        })

        const sphere = new THREE.Mesh(geometry, material)

        // Handle different coordinate formats
        if (Array.isArray(event.coordinates) && event.coordinates.length === 3) {
          // Use the coordinates array directly
          sphere.position.set(
            Number(event.coordinates[0]) || 0,
            Number(event.coordinates[1]) || 0,
            Number(event.coordinates[2]) || 0,
          )
        } else if (event.x !== undefined && event.y !== undefined && event.z !== undefined) {
          // Use x, y, z properties if available
          sphere.position.set(Number(event.x) || 0, Number(event.y) || 0, Number(event.z) || 0)
        } else {
          // Fallback to random position
          sphere.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
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
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.5,
          })
          const line = new THREE.Line(lineGeometry, lineMaterial)
          scene.add(line)
        }
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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("click", handleClick)
        if (onHoverEvent) {
          containerRef.current.removeEventListener("mousemove", handleMouseMove)
          containerRef.current.removeEventListener("mouseleave", handleMouseLeave)
        }
        containerRef.current.removeChild(renderer.domElement)
      }

      window.removeEventListener("resize", handleResize)

      scene.clear()
      eventObjects.forEach((obj) => {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((material) => material.dispose())
        } else {
          obj.material.dispose()
        }
      })
    }
  }, [events, selectedEventId, hoveredEventId, onSelectEvent, onHoverEvent, isMouseOverEvent])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {events.length === 0 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#ffffff]/70">
          <p>no events to display</p>
        </div>
      )}
    </div>
  )
}

