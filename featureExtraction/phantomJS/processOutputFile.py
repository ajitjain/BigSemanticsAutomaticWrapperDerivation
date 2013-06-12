#@author : Sanjeev Kumar Singh
#Date: 29th April, 2013

import math

list1 = ['bgh','fgh','blch','brch','btch','btcs','btcv','bbch']
#list11 = ['bgs','bgv','fgs','fgv','blcs','blcv','brcs','brcv','btcs','btcv',,'bbcs','bbcv']
list2 = ['x','y','w','h']
#list3 = ['height']
list4a = ['relx','rely']
list4b = ['relw','relh']
list4c = ['relbgh','relfgh']
#list41 = ['relbgs','relbgv','relfgs','relfgv']
list5 = ['wordcnt']
list6 = ['ml','mr','mt','mb','font']
list7 = ['aspectRatio']

list = ['true', 'false', 'solid', 'none', 'auto', 'inset', 'dotted', 'undefined', 'dashed', 'groove']

print len(list1) + len(list2) + len(list4a) + len(list4b) + len(list4c) + len(list5) + len(list6) + len(list7)

fr = open("grmm_seen.txt", 'rb')
lines = fr.readlines()

fw = open("test_seen.txt", 'wb')

for index in range(len(lines)):
    tokens = lines[index].split()
    if len(tokens) == 0:
        print index

for line in lines:
    tokens =  line.split()
    #if len(tokens) == 0:
    #    fw.write('\n')
    
    for token in tokens:
        sub_token = token.split(':')

        if len(sub_token) == 2:
            if sub_token[1] not in list and sub_token[1][-1] != '%' and sub_token[1][-2:] != 'em':
                if sub_token[1].endswith('px'):
                    sub_token[1] = sub_token[1].strip('px')
                    
                if sub_token[1].endswith('pt'):
                    sub_token[1] = sub_token[1].strip('pt')                        
                
                if sub_token[0] in list1:  
                    if sub_token[1].startswith('NaN'):
                        sub_token[1] = 0
                    else:    
                        sub_token[1] = int(sub_token[1])
                        sub_token[1] = sub_token[1]/30 + 1
                elif sub_token[0] in list2:
                    sub_token[1] = float(sub_token[1])
                    sub_token[1] = sub_token[1]*100
                    sub_token[1] = int(sub_token[1]/8)
                elif sub_token[0] in list4a:
               	    sub_token[1] = int(sub_token[1])
                    if sub_token[1] < 1500:
                        sub_token[1] = sub_token[1]/150
                    else:
                        sub_token[1] = (1500/150) + 1
                elif sub_token[0] in list4b:
               	    sub_token[1] = int(sub_token[1])
                    if sub_token[1] < 3000:
                        sub_token[1] = sub_token[1]/300
                    else:
                        sub_token[1] = (3000/300) + 1
                elif sub_token[0] in list4c:
                    sub_token[1] = int(sub_token[1])
                    if sub_token[1] < 300:
                        sub_token[1] = sub_token[1]/30
                    else:
                        sub_token[1] = (300/30) + 1                
                elif sub_token[0] in list5:
               	    sub_token[1] = int(sub_token[1])
                    sub_token[1] = int(math.log(sub_token[1], 2))
                elif sub_token[0] in list6:   
               	    sub_token[1] = int(sub_token[1])
                    sub_token[1] = sub_token[1]/7
                elif sub_token[0] in list7:
                    sub_token[1] = float(sub_token[1])
                    sub_token[1] = int(sub_token[1]+0.5)    
                
            fw.write('%s:%s ' %(sub_token[0], str(sub_token[1])))
                
        else:
            fw.write('%s ' %(sub_token[0])) 
            
    fw.write('\n') 
                
    #print tokens
    
