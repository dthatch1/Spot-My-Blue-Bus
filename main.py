
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from pandas import ExcelFile

# https://www.youtube.com/watch?v=yylnC3dr_no
cred = credentials.Certificate("D:\Python\GoogleActions\spot-99963-firebase-adminsdk-vd5c5-d910cf1177.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
doc_ref = db.collection(u'sampleData').document(u'inspiration')
doc_ref.set({
    u'quote' : "quote",
    u'author': True,
})

df = pd.read_excel('D:\Python\GoogleActions\Book1.xlsx', sheet_name='Sheet1')
print("Column headings:")
print(df.columns)

print(df['Start'])

for i in df.index:

    start = str(df['Start'][i].hour)+str(df['Start'][i].minute)
    while len(start) < 4:
        start = start+'0'
    

    end = str(df['End'][i].hour)+str(df['End'][i].minute)
    while len(end) < 4:
        end = end+'0'
    
    doc_ref = db.collection(u'WSWeekOutbound').document(start)
    doc_ref.set({
        u'start' : start,
        u'end': end,
    })
