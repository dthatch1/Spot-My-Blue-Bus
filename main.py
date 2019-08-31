
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
    delete_collection(db.collection(sheet), 60)
    for i in df.index:
        j =0
        Tcol =[]
        Tval = []
        for col in df.columns:
            Tcol.append(str(col))
            if col not in 'day':
                try:
                    Tval.append(str(df[col][i].hour)+str(df[col][i].minute))
                except:
                    print(col, i, df[col][i])
                if df[col][i].minute < 10:
                    Tval[j] = Tval[j]+'0'
                
            else:
                Tval.append(str(df[col][i]))
            j=j+1

        doc_ref = db.collection(sheet).document(Tval[0]).delete()
        doc_ref = db.collection(sheet).document(Tval[0])
        if len(df.columns.values.tolist()) is 6:
            doc_ref.set({
                Tcol[0]:int(Tval[0]),
                Tcol[1]:int(Tval[1]),
                Tcol[2]:int(Tval[2]),
                Tcol[3]:int(Tval[3]),
                Tcol[4]:int(Tval[4]),
                Tcol[5]:int(Tval[5])
            })
        elif len(df.columns.values.tolist()) is 5:
            doc_ref.set({
                Tcol[0]:int(Tval[0]),
                Tcol[1]:int(Tval[1]),
                Tcol[2]:int(Tval[2]),
                Tcol[3]:int(Tval[3]),
                Tcol[4]:int(Tval[4])
            })
        elif len(df.columns.values.tolist()) is 7:
            doc_ref.set({
                Tcol[0]:int(Tval[0]),
                Tcol[1]:int(Tval[1]),
                Tcol[2]:int(Tval[2]),
                Tcol[3]:int(Tval[3]),
                Tcol[4]:int(Tval[4]),
                Tcol[5]:int(Tval[5]),
                Tcol[6]:int(Tval[6])
            })



# df = pd.read_excel('D:\Python\GoogleActions\Book1.xlsx', sheet_name='WSWeekOutbound')
# print("Column headings:")
# print(df.columns)

print("Started process...")
Book1 = pd.ExcelFile("D:\Python\GoogleActions\Spot-My-Blue-Bus\Book1.xlsx")

cred = credentials.Certificate("D:\Python\GoogleActions\Spot-My-Blue-Bus\spot-99963-firebase-adminsdk-vd5c5-d910cf1177.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
print(". . ")
print(Book1.sheet_names)

for sheet in Book1.sheet_names:
    df = Book1.parse(sheet)
    processWS(sheet,df,db)
    print("processed :",sheet)

