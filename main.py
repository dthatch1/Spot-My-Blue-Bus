
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from pandas import ExcelFile

# https://www.youtube.com/watch?v=yylnC3dr_no
# cred = credentials.Certificate("D:\Python\GoogleActions\spot-99963-firebase-adminsdk-vd5c5-d910cf1177.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()
# doc_ref = db.collection(u'sampleData').document(u'inspiration')
# doc_ref.set({
#     u'quote' : "quote",
#     u'author': True,
# })

def delete_collection(coll_ref, batch_size):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        # print(u'Deleting doc {} => {}'.format(doc.id, doc.to_dict()))
        doc.reference.delete()
        deleted = deleted + 1
    print( "documents deleted:",deleted)
    # if deleted >= batch_size:
    #     return delete_collection(coll_ref, batch_size)


def processWS(sheet,df,db):
    delete_collection(db.collection(sheet), 50)
    for i in df.index:

        start = str(df['start'][i].hour)+str(df['start'][i].minute)
        if df['start'][i].minute < 10:
            start = start+'0'
        

        floral = str(df['floral'][i].hour)+str(df['floral'][i].minute)
        if df['floral'][i].minute < 10:
            floral = floral+'0'

        murray = str(df['murray'][i].hour)+str(df['murray'][i].minute)
        if df['murray'][i].minute < 10:
            murray = murray+'0'

        end = str(df['end'][i].hour)+str(df['end'][i].minute)
        if df['end'][i].minute < 10:
            end = end+'0'
        # doc_ref = db.collection(sheet).document(start).delete()
        doc_ref = db.collection(sheet).document(start)
        doc_ref.set({
            u'start' : int(start),
            u'floral' : int(floral),
            u'murray' : int(murray),
            u'end': int(end),
        })

def processDCL(sheet,df,db):
    delete_collection(db.collection(sheet), 50)
    for i in df.index:

        start = str(df['start'][i].hour)+str(df['start'][i].minute)
        if df['start'][i].minute < 10:
            start = start+'0'

        murray = str(df['murray'][i].hour)+str(df['murray'][i].minute)
        if df['murray'][i].minute < 10:
            murray = murray+'0'

        end = str(df['end'][i].hour)+str(df['end'][i].minute)
        if df['end'][i].minute < 10:
            end = end+'0'

        # doc_ref = db.collection(sheet).document(start).delete()
        doc_ref = db.collection(sheet).document(start)
        doc_ref.set({
            u'start' : int(start),
            u'murray' : int(murray),
            u'end': int(end),
        })



# df = pd.read_excel('D:\Python\GoogleActions\Book1.xlsx', sheet_name='WSWeekOutbound')
# print("Column headings:")
# print(df.columns)


Book1 = pd.ExcelFile('D:\Python\GoogleActions\DCL.xlsx')

cred = credentials.Certificate("D:\Python\GoogleActions\spot-99963-firebase-adminsdk-vd5c5-d910cf1177.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

for sheet in Book1.sheet_names:
    if "WS" in sheet:
        df = Book1.parse(sheet)
        processWS(sheet,df,db)
        print("processed :",sheet)
    elif "DCL" in sheet:
        df = Book1.parse(sheet)
        processDCL(sheet,df,db)
        print("processed :",sheet)

