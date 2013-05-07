#@author : Sanjeev Kumar Singh
#Date: 29th April, 2013

import math

list1 = ['bgr','bgg','bgb','fgr','fgg','fgb','blcr','blcg','blcb','brcr','brcg','brcb','btcr','btcg','btcb',\
         'bbcr','bbcg','bbcb']
list2 = ['x','y']
list3 = ['w','h']
#list3 = ['height']
list4 = ['relx','rely','relw','relh','relr','relg','relb','relfr','relfg','relfb']
list5 = ['wordcnt']
list6 = ['ml','mr','mt','mb','font']

list = ['true', 'false', 'solid', 'none', 'auto', 'inset', 'dotted', 'undefined', 'dashed', 'groove']

print len(list1) + len(list2) + len(list3) + len(list4) + len(list5) + len(list6)

fr = open("grmm_train.txt", 'rb')
lines = fr.readlines()

fw = open("new_file.txt", 'wb')

for index in range(len(lines)):
    tokens = lines[index].split()
    if len(tokens) == 0:
        print index

for line in lines:
    tokens =  line.split()
    if len(tokens) == 0:
        fw.write('\n')
    
    for token in tokens:
        sub_token = token.split(':')

        if len(sub_token) == 2:
            if sub_token[1] not in list and sub_token[1][-1] != '%' and sub_token[1][-2:] != 'em':
                if sub_token[1].endswith('px'):
                    sub_token[1] = sub_token[1].strip('px')
                
                sub_token[1] = int(sub_token[1])
                
                if sub_token[0] in list1:
                    sub_token[1] = sub_token[1]/25
                elif sub_token[0] in list2:
                    if sub_token[1] < 4000:
                        sub_token[1] = sub_token[1]/400
                    else:
                        sub_token[1] = (4000/400) + 1
                elif sub_token[0] in list3:
                    if sub_token[1] < 1000:
                        sub_token[1] = sub_token[1]/100
                    else:
                        sub_token[1] = (1000/100) + 1
                elif sub_token[0] in list4:
                    if sub_token[1] < 5000:
                        sub_token[1] = sub_token[1]/500
                    else:
                        sub_token[1] = (5000/500) + 1
                elif sub_token[0] in list5:
                    sub_token[1] = int(math.log(sub_token[1], 2))
                elif sub_token[0] in list6:   
                    sub_token[1] = sub_token[1]/7
                
            fw.write('%s:%s ' %(sub_token[0], str(sub_token[1])))
                
        else:
            fw.write('%s ' %(sub_token[0])) 
            
    fw.write('\n') 
                
    #print tokens
    
