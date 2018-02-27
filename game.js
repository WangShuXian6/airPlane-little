import './lib/weapp-adapter'
import * as THREE from './lib/three.js'
//const canvas=wx.createCanvas()
let screenWidth,screenHeight,aspect

const Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0,
};

let scene,camera,fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,renderer, container
let hemisphereLight, shadowLight
let sea,sky,airplane,Sea,Sky,Cloud,AirPlane
let touchePos={
    x:0,
    y:0
}

// wx.getSystemInfo({
//     success(info){
//         WIDTH=screenWidth=info.screenWidth
//         HEIGHT=screenHeight=info.screenHeight
//         aspectRatio=aspect=screenWidth/screenHeight
//     }
// })

WIDTH=screenWidth=window.innerWidth
HEIGHT=screenHeight=window.innerHeight
aspectRatio=aspect=screenWidth/screenHeight

function init(){
    createScene()

    createLights()

    createPlane()

    createSea()

    createSky()

    wx.onTouchMove(handleTouchMove)

    loop()
}

function createScene(){
    scene=new THREE.Scene()

    scene.fog=new THREE.Fog(0xf7d9aa,100,950)

    fieldOfView=60
    nearPlane=1
    farPlane=10000
    camera=new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    )

    camera.position.x=0
    camera.position.y=100
    camera.position.z=200
    //camera.lookAt(new THREE.Vector3(0,90,0))


    renderer=new THREE.WebGLRenderer({
        //alpha:true,
        antialias:true,
        canvas:canvas,
    })

    renderer.setClearColor(0xfff6e6)
    renderer.setSize(WIDTH,HEIGHT)

    renderer.shadowMap.enabled=true
}

function createLights(){
    hemisphereLight=new THREE.HemisphereLight(0xaaaaaa,0x000000,.9)
    shadowLight=new THREE.DirectionalLight(0xffffff,.9)
    shadowLight.position.set(150,350,350)

    shadowLight.shadow.camera.left=-400
    shadowLight.shadow.camera.right=400
    shadowLight.shadow.camera.top=400
    shadowLight.shadow.camera.bottom=-400
    shadowLight.shadow.camera.near=1
    shadowLight.shadow.camera.far=1000

    shadowLight.shadow.mapSize.width=2048
    shadowLight.shadow.mapSize.height=2048

    scene.add(hemisphereLight)
    scene.add(shadowLight)
}

Sea=function(){
    let geom=new THREE.CylinderGeometry(600,600,800,40,10)
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2))

    let mat=new THREE.MeshPhongMaterial({
        color:Colors.blue,
        transparent:true,
        opacity:.6,
        shading:THREE.FlatShading
    })

    this.mesh=new THREE.Mesh(geom,mat)
    this.mesh.receiveShadow=true
}

function createSea(){
    sea=new Sea()
    sea.mesh.position.y=-600
    scene.add(sea.mesh)
}

Cloud=function(){
    this.mesh=new THREE.Object3D()

    let geom=new THREE.BoxGeometry(20,20,20)

    let mat=new THREE.MeshPhongMaterial({
        color:Colors.white
    })

    let nBlocs=3+Math.floor(Math.random()*3)
    for(let i=0;i<nBlocs;i++){
        let m=new THREE.Mesh(geom,mat)

        m.position.x=i*15
        m.position.y=Math.random()*10
        m.position.z=Math.random()*10
        m.rotation.z=Math.random()*Math.PI*2
        m.rotation.y=Math.random()*Math.PI*2

        let s=.1+Math.random()*.9
        m.scale.set(s,s,s)

        m.castShadow=true
        m.receiveShadow=true

        this.mesh.add(m)
    }
}

Sky=function () {
    this.mesh=new THREE.Object3D()
    this.nClouds=20
    let stepAngle=Math.PI*2/this.nClouds

    for(let i=0;i<this.nClouds;i++){
        let c=new Cloud()
        let a=stepAngle*i
        let h=750+Math.random()*200

        c.mesh.position.y=Math.sin(a)*h
        c.mesh.position.x=Math.cos(a)*h

        c.mesh.rotation.z=a+Math.PI/2
        c.mesh.position.z=-400-Math.random()*400

        let s=1+Math.random()*2
        c.mesh.scale.set(s,s,s)

        this.mesh.add(c.mesh)
    }
}

function createSky(){
    sky=new Sky()
    sky.mesh.position.y=-600
    scene.add(sky.mesh)
}

AirPlane=function(){
    this.mesh=new THREE.Object3D()
    let geomCockpit=new THREE.BoxGeometry(60,50,50,1,1,1)
    let matCockpit=new THREE.MeshPhongMaterial({
        color:Colors.red,
        shading:THREE.FlatShading
    })
    let cockpit=new THREE.Mesh(geomCockpit,matCockpit)
    cockpit.castShadow=true
    cockpit.receiveShadow=true
    this.mesh.add(cockpit)

    let geomEngine=new THREE.BoxGeometry(20,50,50,1,1,1)
    let matEngine=new THREE.MeshPhongMaterial({
        color:Colors.white,
        shading:THREE.FlatShading
    })
    let engine=new THREE.Mesh(geomEngine,matEngine)
    engine.position.x=40
    engine.castShadow=true
    engine.receiveShadow=true
    this.mesh.add(engine)

    let geomTailPlane=new THREE.BoxGeometry(15,20,5,1,1,1)
    let matTailPlane=new THREE.MeshPhongMaterial({
        color:Colors.red,
        shading:THREE.FlatShading
    })
    let tailPlane=new THREE.Mesh(geomTailPlane,matTailPlane)
    tailPlane.position.set(-35,25,0)
    tailPlane.castShadow=true
    tailPlane.receiveShadow=true
    this.mesh.add(tailPlane)

    let geomSideWing=new THREE.BoxGeometry(40,8,150,1,1,1)
    let matSideWing=new THREE.MeshPhongMaterial({
        color:Colors.red,
        shading:THREE.FlatShading
    })
    let sideWing=new THREE.Mesh(geomSideWing,matSideWing)
    sideWing.castShadow=true
    sideWing.receiveShadow=true
    this.mesh.add(sideWing)

    let geomPropeller=new THREE.BoxGeometry(20,10,10,1,1,1)
    let matPropeller=new THREE.MeshPhongMaterial({
        color:Colors.brown,
        shading:THREE.FlatShading
    })
    this.propeller=new THREE.Mesh(geomPropeller,matPropeller)
    this.propeller.castShadow=true
    this.propeller.receiveShadow=true

    let geomBlade=new THREE.BoxGeometry(1,100,20,1,1,1)
    let matBlade=new THREE.MeshPhongMaterial({
        color:Colors.brownDark,
        shading:THREE.FlatShading
    })
    let blade=new THREE.Mesh(geomBlade,matBlade)
    blade.position.set(8,0,0)
    blade.castShadow=true
    blade.receiveShadow=true
    this.propeller.add(blade)
    this.propeller.position.set(50,0,0)
    this.mesh.add(this.propeller)
}

function createPlane(){
    airplane=new AirPlane()
    airplane.mesh.scale.set(.25,.25,.25)
    airplane.mesh.position.y=100
    scene.add(airplane.mesh)
}

function loop() {
    //airplane.propeller.rotation.x+=0.3
    sea.mesh.rotation.z+=0.005
    sky.mesh.rotation.z+=0.01

    updatePlane()

    renderer.render(scene,camera)
    requestAnimationFrame(loop)
}

function handleTouchMove(event){
    let tx=-1+(event.changedTouches[0].clientX/WIDTH)*2
    let ty=1-(event.changedTouches[0].clientY/HEIGHT)*2
    touchePos={
        x:tx,
        y:ty
    }
}

function updatePlane(){
    let targetX = normalize(touchePos.x, -1, 1, -100, 100);
    let targetY = normalize(touchePos.y, -1, 1, 25, 175);

    airplane.mesh.position.y = targetY;
    airplane.mesh.position.x = targetX;
    airplane.propeller.rotation.x += 0.3;
}

function normalize(v,vmin,vmax,tmin,tmax){
    let nv=Math.max(Math.min(v,vmax),vmin)
    let dv=vmax-vmin
    let pc=(nv-vmin)/dv
    let dt=tmax-tmin
    let tv=tmin+(pc*dt)
    return tv
}


init()