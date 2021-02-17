import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image,TextInput,KeyboardAvoidingView,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../config'
import firebase from 'firebase';


export default class BookTransactionScreen extends React.Component{
constructor(){
    super();
    this.state={
        hasCameraPermissions:null,
        scanned:false,
        scannedData:'',
        buttonState:'normal',
        scannedBookId:'',
        scannedStudentId:'',
        transactionMessage:''
    }
}

getCameraPermissions= async(id)=>
{
const {status}= await Permissions.askAsync(Permissions.CAMERA);

this.setState({hasCameraPermissions:status=="granted",buttonState:id,scanned:false})
}


handleBarCodeScanned=async({type,data})=>{
    var buttonState=this.state.buttonState;
    if(buttonState=="BookId")
    {
        this.setState({
            scannedBookId:data,scanned:true,buttonState:'normal'
        })
    }
    else if (buttonState=="StudentId")
    {
        this.setState({
            scannedStudentId:data,scanned:true,buttonState:'normal'
        }) 
    }
    
}

checkStudentEligibilityBookReturn=async()=>{
  const studentRef=await db.collection("Transaction").where("bookId","==",this.state.scannedBookId).limit(1).get();
  var studentIsEligible='';
  
   studentRef.docs.map((doc)=>{
      var data=doc.data();
      if(data.studentId===this.state.scannedStudentId)
      {
        studentIsEligible=true;
      }
      else
      {
        studentIsEligible=false;
        alert("The book wasnt issued by the student");
        this.setState({
          scannedBookId:'',scannedStudentId:''
        })
      }
    })
  
  return studentIsEligible;
}



checkBookIssueEligibilty=async()=>{
  const studentRef=await db.collection("Students").where("studentId","==",this.state.scannedStudentId).get();
  var studentIsEligible='';
  if(studentRef.docs.length==0)
  {
    studentIsEligible=false;
    alert("Student id not there in database");
    this.setState({
      scannedStudentId:'',scannedBookId:''
    })
  }
  else
  {
    studentRef.docs.map((doc)=>{
      var data=doc.data();
      if(data.noofBooksIssued<2)
      {
        studentIsEligible=true;
      }
      else
      {
        studentIsEligible=false;
        alert("The student has already issued 2 books");
        this.setState({
          scannedBookId:'',scannedStudentId:''
        })
      }
    })
  }
  return studentIsEligible;
}



checkBookEligibility= async()=>{
const bookRef=await db.collection("Books").where("bookId","==",this.state.scannedBookId).get();
var transactionType='';
if(bookRef.docs.length==0)
{
  transactionType=false;
}
else
{
  bookRef.docs.map((doc)=>{
    var book=doc.data();
    if(book.bookAvailability)
    {
      transactionType="Issue"
    }
    else
    {
      transactionType="Return";
    }
  })
}
return transactionType;
}

handleTransaction = async()=>{
  
    var transactionType= await this.checkBookEligibility();
    if(!transactionType)
    {
      alert("book not available in the library database");
      this.setState({
        scannedBookId:'',scannedStudentId:''
      })
    }
    else if (transactionType=="Issue")
    {
      var studentIsEligible= await this.checkBookIssueEligibilty();
      if(studentIsEligible)
      {
        this.initiateBookIssue();
        alert("book Issued to student");
      }
    }
    else if (transactionType=="Return")
    {
      var studentIsEligible= await this.checkStudentEligibilityBookReturn();
      if(studentIsEligible)
      {
        this.initiateBookReturn();
        alert("Book Returned to Library")
      }
    }
   
  }

  initiateBookIssue = async ()=>{
    //add a transaction
    db.collection("Transaction").add({
      'studentId' : this.state.scannedStudentId,
      'bookId' : this.state.scannedBookId,
      'date' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType' : "Issue"
    })

    //change book status
    db.collection("Books").doc(this.state.scannedBookId).update({
      'bookAvailability' : false
    })
    //change number of issued books for student
    db.collection("Students").doc(this.state.scannedStudentId).update({
      'noofBooksIssued' : firebase.firestore.FieldValue.increment(1)
    })

    this.setState({
      scannedStudentId : '',
      scannedBookId: ''
    })
  }

  initiateBookReturn = async ()=>{
    //add a transaction
    db.collection("Transaction").add({
      'studentId' : this.state.scannedStudentId,
      'bookId' : this.state.scannedBookId,
      'date'   : firebase.firestore.Timestamp.now().toDate(),
      'transactionType' : "Return"
    })

    //change book status
    db.collection("Books").doc(this.state.scannedBookId).update({
      'bookAvailability' : true
    })

    //change book status
    db.collection("Students").doc(this.state.scannedStudentId).update({
      'noofBooksIssued' : firebase.firestore.FieldValue.increment(-1)
    })

    this.setState({
      scannedStudentId : '',
      scannedBookId : ''
    })
  }

    render()
{

    const hasCameraPermissions=this.state.hasCameraPermissions;
    const scannedData=this.state.scannedData;
    const scanned=this.state.scanned;
    const buttonState=this.state.buttonState;
    if(buttonState!="normal" && hasCameraPermissions)
    {
        return (
            <BarCodeScanner onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned} style={StyleSheet.absoluteFillObject}
        />)
    }
    else if(buttonState=="normal")
    {
    
        return(
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <View style={styles.container}>
              <View>
                <Image
                  source={require("../assets/booklogo.jpg")}
                  style={{width:200, height: 200}}/>
                <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
              </View>
              <View style={styles.inputView}>
              <TextInput onChangeText={text=>{
                this.setState({scannedBookId:text})
              }}
                style={styles.inputBox}
                placeholder="Book Id"
                value={this.state.scannedBookId}/>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{
                  this.getCameraPermissions("BookId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
              </View>
              <View style={styles.inputView}>
              <TextInput  onChangeText={text=>{
                this.setState({scannedStudentId:text})
              }}
                style={styles.inputBox}
                placeholder="Student Id"
                value={this.state.scannedStudentId}/>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{
                  this.getCameraPermissions("StudentId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
               
              </TouchableOpacity>
              
              </View>
              <TouchableOpacity onPress={async ()=>{
                    var transactionMessage=await this.handleTransaction();
                }} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>SUBMIT</Text>
                </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
          );
          
        }
      }
    }



    const styles = StyleSheet.create({
        submitButton:{
            backgroundColor: '#FBC02D',
            width: 100,
            height:50
          },
        submitButtonText:{
            padding: 10,
            textAlign: 'center',
            fontSize: 20,
            fontWeight:"bold",
            color: 'white'
        },
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        },
        displayText:{
          fontSize: 15,
          textDecorationLine: 'underline'
        },
        scanButton:{
          backgroundColor: '#2196F3',
          padding: 10,
          margin: 10
        },
        buttonText:{
          fontSize: 15,
          textAlign: 'center',
          marginTop: 10
        },
        inputView:{
          flexDirection: 'row',
          margin: 20
        },
        inputBox:{
          width: 200,
          height: 40,
          borderWidth: 1.5,
          borderRightWidth: 0,
          fontSize: 20
        },
        scanButton:{
          backgroundColor: '#66BB6A',
          width: 50,
          borderWidth: 1.5,
          borderLeftWidth: 0
        }
      });