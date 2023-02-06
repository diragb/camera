// Packages:
import React, { useRef, useState, useEffect, Context } from 'react'
import styled from 'styled-components'


// Imports:
import { AiFillAudio, AiFillSound, AiFillCamera } from 'react-icons/ai'


// Styles:
const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
`

const VideoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`

const Video = styled.video`
  margin-top: 5rem;
  border-radius: 1rem;
`

const Button = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1.25rem;
  color: white;
  font-weight: 600;
  border-radius: 0.25rem;
  background-color: #008049;
  user-select: none;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: #00AB61;
  }
`

const DeviceList = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
  margin-top: 5rem;
  padding: 0 1rem;
`

const DeviceListItemWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 0.25rem;
  padding: 1rem 0.5rem;
  border-radius: 0.25rem;
  color: white;
  background-color: transparent;
  user-select: none;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #333333;
  }
`

const Images = styled.div`
  width: calc(100vw - 2rem);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  overflow-x: auto;
`

const Image = styled.img`
  height: 15rem;
`


// Functions:
const DeviceListItem = (props: { device: MediaDeviceInfo }) => {
  let Icon = () => <></>
  switch (props.device.kind) {
    case 'audioinput':
      Icon = () => <AiFillAudio style={{ marginRight: '0.5rem', fontSize: '1.5rem' }} />
      break
    case 'audiooutput':
      Icon = () => <AiFillSound style={{ marginRight: '0.5rem', fontSize: '1.5rem' }} />
      break
    case 'videoinput':
      Icon = () => <AiFillCamera style={{ marginRight: '0.5rem', fontSize: '1.5rem' }} />
      break
  }

  return (
    <DeviceListItemWrapper>
      <Icon />
      <span>{ props.device.label }</span>
    </DeviceListItemWrapper>
  )
}

const App = () => {
  // Ref:
  let videoRef = useRef<HTMLVideoElement | null>(null)
  let canvasRef = useRef<HTMLCanvasElement | null>(null)

  // State:
  const [ arePermissionsGranted, setArePermissionsGranted ] = useState<boolean | null>(null)
  const [ mediaDevices, setMediaDevices ] = useState<MediaDeviceInfo[]>([])
  const [ errorPrompt, setErrorPrompt ] = useState('')
  const [ videoResolution, setVideoResolution ] = useState({
    width: '464px',
    height: '848px'
  })
  const [ photos, setPhotos ] = useState<any[]>([])

  // Functions:
  const getPermissions = async () => {
    try {
      setErrorPrompt('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
      setMediaDevices((await navigator.mediaDevices.enumerateDevices()).filter(mediaDevice => mediaDevice.label !== ''))
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        const videoSettings = mediaStream.getVideoTracks()[0].getSettings()
        const [ width, height ] = [ videoSettings.width, videoSettings.height ]
        if (width && height) {
          setVideoResolution({
            width: `${ width }px`,
            height: `${ height }px`
          })
          canvasRef.current?.setAttribute('width', `${ width }px`)
          canvasRef.current?.setAttribute('height', `${ height }px`)
        }
      }
      setArePermissionsGranted(true)
    } catch(e) {
      setErrorPrompt((e as Error).message)
      setArePermissionsGranted(false)
    }
  }

  const clearLastPhoto = () => {
    if (!canvasRef.current) return
    const context = canvasRef.current.getContext('2d') as CanvasRenderingContext2D
    context.fillStyle = '#FFFFFF'
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    const data = canvasRef.current.toDataURL('image/png')
    setPhotos(_photos => [ ..._photos, { id: Date.now(), data } ].reverse())
}

  const capture = () => {
    if (!canvasRef.current || !videoRef.current) return
    var context = canvasRef.current.getContext('2d') as CanvasRenderingContext2D
    if (videoResolution.width && videoResolution.height) {
      const width = parseInt(videoResolution.width.replace('px', ''))
      const height = parseInt(videoResolution.height.replace('px', ''))
      canvasRef.current.width = width
      canvasRef.current.height = height
      context.drawImage(videoRef.current, 0, 0, width, height)
      const data = canvasRef.current.toDataURL('image/png')
      setPhotos(_photos => [ ..._photos, { id: Date.now(), data } ].reverse())
    } else {
      clearLastPhoto()
    }
}

  // Effects:
  useEffect(() => {
    getPermissions()
  }, [])

  // Return:
  return (
    <Wrapper>
      <div style={{ color: 'red' }}>{ errorPrompt }</div>
      <VideoWrapper>
        {
          arePermissionsGranted ? (
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Video
                ref={ videoRef }
                width={ videoResolution.width }
                height={ videoResolution.height }
                autoPlay
              />
              <AiFillCamera
                style={{
                  position: 'relative',
                  zIndex: 1,
                  marginTop: '-2rem' ,
                  padding: '1rem',
                  color: 'black',
                  fontSize: '2rem',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                onClick={ capture }
              />
            </div>
          ) : (
            <Button onClick={ getPermissions }>Please grant permissions</Button>
          )
        }
      </VideoWrapper>
      <DeviceList>
        { mediaDevices.map(mediaDevice => <DeviceListItem key={ mediaDevice.label } device={ mediaDevice } />) }
      </DeviceList>
      <canvas ref={ canvasRef } style={{ position: 'absolute', zIndex: -1, top: 0, left: 0, filter: 'opacity(0)' }} />
      <div style={{ padding: '0 1rem' }}>
        <div style={{ padding: '1rem 0', fontWeight: '700', color: 'white' }}>Captures</div>
        <Images>
          { photos.map(photo => <Image key={ photo.id } src={ photo.data } />) }
        </Images>
      </div>
    </Wrapper>
  )
}


// Exports:
export default App
