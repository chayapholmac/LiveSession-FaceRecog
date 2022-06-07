import "./App.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./API";
import ReactPlayer from "react-player";
import * as faceapi from 'face-api.js'
import { wait } from "@testing-library/user-event/dist/utils";


// Join Session
function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState(null);
  const onClick = async () => {
    await getMeetingAndToken(meetingId);
  };
  return (
    <div className="home-page">
      <input
        type="text"
        placeholder="Enter Meeting Id"
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <button onClick={onClick}>Join</button>
      <button onClick={onClick}>Create Meeting</button>
    </div>
  );
}


// Manage About Video of Owner Meeting and Participant
function VideoComponent(props) {

  const micRef = useRef(null);

  const [camFirstTime, setCamFirstTime] = useState(true)
  const [currentCamOn, setCurrentCamOn] = useState(false)

  const { webcamStream, micStream, webcamOn, micOn } = useParticipant(
    props.participantId
  );

  const videoHeight = 480
  const videoWidth = 640

  const videoRef = useRef()
  const canvasRef = useRef()

  useEffect(() => {
    if (micRef.current) {
      if (micOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn])

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(() => {
        console.log('load finish')
        if (webcamOn) {
          startVideo()
        } else {
          stopVideo()
        }
      })
    }
    loadModels();
  }, [webcamOn])

  const startVideo = () => {
      // navigator.getUserMedia(
      //   {
      //     video: {}
      //   },
      //   stream => videoRef.current.srcObject = stream,
      //   err => console.log(err),
      // )
      navigator.getUserMedia(
        {
          video: true,
        },
        (stream) => {
          let video = document.getElementsByClassName('app__videoFeed')[0];
          if (video) {
            video.srcObject = stream;
          }
        },
        (err) => console.error(err)
      );
  }

  const stopVideo = (stream) => {
    if (camFirstTime){
      setCamFirstTime(false)
    } 
    else if (!webcamOn){
      setCurrentCamOn(false)
      let video = document.getElementsByClassName('app__videoFeed')[0];
		  video.srcObject.getTracks()[0].stop();
    } 
  }

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
      const displaySize = {
        width: videoWidth,
        height: videoHeight
      }

      faceapi.matchDimensions(canvasRef.current, displaySize)
      const detection = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      const resizedDetection = faceapi.resizeResults(detection, displaySize)
      canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight)
      // faceapi.draw.drawDetections(canvasRef.current, resizedDetection)d

      console.log(detection)
    }, 2000)
  }

  return (
    <div className="App">
      {micOn && micRef && <audio ref={micRef} autoPlay />}
      {/* {webcamOn && (
        <div className='position-flex justify-content-center'>
          <video className="app__videoFeed" ref={videoRef} autoPlay muted height={videoHeight} width={videoWidth}  />
          <canvas className='position-absolute' ref={canvasRef} />
        </div>
      )} */}
      <div className='position-flex justify-content-center'>
          <video className="app__videoFeed" ref={videoRef} autoPlay muted height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay}  />
          <canvas className='position-absolute' ref={canvasRef} />
        </div>
    </div>
  );


 // const videoStream = useMemo(() => {
  //   if (webcamOn) {
  //     const mediaStream = new MediaStream();
  //     mediaStream.addTrack(webcamStream.track);
  //     return mediaStream
  //   }
  // }, [webcamStream, webcamOn]);

          {/* <ReactPlayer
            ref={videoRef}
            playsinline
            pip={false}
            light={false}
            controls={true}
            muted={true}
            playing={true}
            url={videoStream}
            height={"180px"}
            width={"320px"}
            onPlay={handleVideoOnPlay}
            onError={(err) => {
              console.log(err, "participant video error")
            }}
          /> */}

  // useEffect(() => {
  //   const loadModels = async () => {
  //     const MODEL_URL = process.env.PUBLIC_URL + '/models';
  //     Promise.all([
  //       faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  //       faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  //       faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  //       faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  //     ]).then(startVideo)
  //   }
  //   loadModels();
  // }, [])

  // const startVideo = () => {
  //   navigator.getUserMedia(
  //     {
  //       video: {}
  //     },
  //     stream => videoRef.current.srcObject = stream,
  //     err => console.log(err),
  //   )
  // }

  // // const handleVideoOnPlay = () => {
  // //   setInterval(async () => {
  // //     canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
  // //     const displaySize = {
  // //       width: videoWidth,
  // //       height: videoHeight
  // //     }

  // //     faceapi.matchDimensions(canvasRef.current, displaySize)
  // //     const detection = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
  // //     const resizedDetection = faceapi.resizeResults(detection, displaySize)
  // //     canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight)
  // //     faceapi.draw.drawDetections(canvasRef.current, resizedDetection)

  // //     console.log(detection)
  // //   }, 500)
  // // }
}

// Control Microphone Webcam other button in session
function Controls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();

  const [onOfWebcam, setOnOfWebcam] = useState(true)
  const onOfwebcam = () => {
    setOnOfWebcam(!onOfWebcam)
  }

  const [onOfMic, setOnOfMic] = useState(true)
  const onOfmic = () => {
    setOnOfMic(!onOfMic)
  }

  return (
    <div>
      <button onClick={leave}>Leave</button>
      <button onClick={() => {
        toggleMic()
        onOfmic()
      }}>{onOfMic ? "Microphone Off" : "Microphone On"}</button>
      <button onClick={() => {
        toggleWebcam()
        onOfwebcam()
      }}>{onOfWebcam ? "Webcam Off" : "Webcam On"}</button>
    </div>
  );
}

// Show Detail of Session [ In / Out ]
function Container(props) {
  const { participants, join, isMeetingJoined, startHls } = useMeeting({
    onMeetingJoined: () => {
      startHls();
    },
    onHlsStarted: (downstreamUrl) => {
      console.log(downstreamUrl)
    },
  });

  return (
    <div className="container">
      <h3>Meeting Id: {props.meetingId}</h3>
      {isMeetingJoined ? (
        <div>
          <Controls />
          {[...participants.keys()].map((participantId) => (
            <VideoComponent key={participantId} participantId={participantId} />
          ))}
        </div>
      ) : (
        <button onClick={join}>Join</button>
      )}
    </div>
  );
}

function MeetingContainer() {
  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async (id) => {
    const meetingId =
      id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: false,
        webcamEnabled: false,
        name: "Chayaphol Meeprasert",
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => <Container meetingId={meetingId} />}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}

function App() {
  return (
    <MeetingContainer />
  )
}

export default App;