import React from 'react';
import { StyleSheet, Text, View,FlatList,TextInput,TouchableOpacity } from 'react-native';
import db from '../config';

export default class SearchScreen extends React.Component{
constructor()
{
  super();
  this.state={
    allTransaction:[],
    lastVisibleTransaction:[],search:''
  }
}
componentDidMount=async()=>{
  var teamRef=await db.collection("Transaction").limit(10).get();
  teamRef.docs.map((doc)=>{
this.setState({
  allTransaction:[...this.state.allTransaction, doc.data()],
  lastVisibleTransaction:doc
})
  })
  
}

fetchMoreTransactions = async ()=>{
  
  var text = this.state.search;
if(text!=undefined && text!=''){
  text=text.toUpperCase();
  var enteredText = text.split("")

  
  if (enteredText[0].toUpperCase() ==='B'){
  const query = await db.collection("Transaction").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
  query.docs.map((doc)=>{
    this.setState({
      allTransaction: [...this.state.allTransaction, doc.data()],
      lastVisibleTransaction: doc
    })
  })
}
  else if(enteredText[0].toUpperCase() === 'S'){
    const query = await db.collection("Transaction").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    query.docs.map((doc)=>{
      this.setState({
        allTransaction: [...this.state.allTransaction, doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }
}
else
{
  const query = await db.collection("Transaction").startAfter(this.state.lastVisibleTransaction).limit(10).get()
  query.docs.map((doc)=>{
    this.setState({
      allTransaction: [...this.state.allTransaction, doc.data()],
      lastVisibleTransaction: doc
    })
  })
}
}
  searchTransactions= async(text) =>{
    this.setState({
      allTransaction:[],
      lastVisibleTransaction:[]          
    })
    var enteredText = text.split("")  
    if (enteredText!='' && enteredText[0].toUpperCase() ==='B'){
      const transaction =  await db.collection("Transaction").where('bookId','==',text).get()
      
      transaction.docs.map((doc)=>{
        alert(doc.data().bookId);
        this.setState({
          allTransaction:[...this.state.allTransaction,doc.data()],
          lastVisibleTransaction:doc          
        })
      })
    }
    else if( enteredText!='' && enteredText[0].toUpperCase() === 'S'){
      const transaction = await db.collection('Transaction').where('studentId','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransaction:[...this.state.allTransaction,doc.data()],
          lastVisibleTransaction:doc  
         
        })
      })
    }
    else
    {
      const transaction = await db.collection('Transaction').limit(10).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransaction:[...this.state.allTransaction,doc.data()],
          lastVisibleTransaction:doc  
         
        })
      })
    }
  }
  render()
{
    return (
      <View style={styles.container}>
        
         <View style={styles.searchBar}>
        <TextInput 
          style ={styles.bar}
          placeholder = "Enter Book Id or Student Id"
          onChangeText={(text)=>{this.setState({search:text})}}/>
          <TouchableOpacity
            style = {styles.searchButton}
            onPress={()=>{this.searchTransactions(this.state.search)}}
          >
            <Text>Search</Text>
          </TouchableOpacity>
          <Text >{this.state.allTransaction.length}</Text>
          </View>
         
         <FlatList
          data={this.state.allTransaction}
          
          renderItem={({item})=>(
           
            <View style={{borderBottomWidth: 2}}>
              
              <Text>{"Book Id: " + item.bookId}</Text>
              <Text>{"Student id: " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: "+item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor= {(item, index)=> index.toString()}
         onEndReached={this.fetchMoreTransactions}
         onEndReachedThreshold={0.7}
        /> 
       </View>
       
    )
}
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  });
  