# @author: Sanjeev Kumar Singh
# @Created on: 23rd April, 2013


import httplib
import urlparse
import bs4

class WebCrawler:
    '''Recursively follow redirects until there isn't a location header'''       
    def getFinalRedirect(self, url, depth=0):
        if depth > 10:
            raise Exception("Redirected "+depth+" times, giving up.")
            
        try:
            o = urlparse.urlparse(url,allow_fragments=True)
            conn = httplib.HTTPConnection(o.netloc)
            path = o.path
            if o.query:
                path +='?'+o.query
            conn.request("HEAD", path)
            res = conn.getresponse()
            headers = dict(res.getheaders())
            if headers.has_key('location') and headers['location'] != url:
                return self.getFinalRedirect(headers['location'], depth+1)
            else:
                return url
        except:
            return False  

    ''' gets the html content of a given url'''
    def getHtmlContent(self, url):
        try:
            o = urlparse.urlparse(url,allow_fragments=True)    
                    
            #open connection
            conn = httplib.HTTPConnection(o.netloc, timeout=10)    
            path = '' + o.path
            if o.query != '':
                path += '?'+ o.query
            
            conn.request("GET", path)
            res = conn.getresponse()
            data = res.read()
            
            #close connection
            conn.close()
            return data
            
        except:
            return 'ERROR'
    
    '''gets the list of hrefs embedded in the page'''
    def getHrefs(self, htmlText):
        hrefsList = []
        soup = bs4.BeautifulSoup(htmlText)
        for link in soup.find_all('a'):
            hrefsList.append(link.get('href'))
        return hrefsList
    
    '''gets the filtered href list embedded in the page'''
    def filterhrefs(self, filter, hrefsList):
        filteredHrefs = []
        for href in hrefsList:
            if filter in href:
                filteredHrefs.append(href)
        return filteredHrefs
    
    '''main function'''
    def main(self, file_list):
        finalListOfUrls_target = []
        finalListOfUrls_walmart = []
        finalListOfUrls_amazon = []
        finalListOfUrls_newegg = []
        
        for file in file_list:
            fr = open(file, 'rb')
            urls = fr.readlines()
            fr.close()
            
            for url in urls:
                url = url.strip()
                final_url = self.getFinalRedirect(url)
                htmlText = self.getHtmlContent(final_url)
                hrefs = self.getHrefs(htmlText)
                hrefs = [x for x in hrefs if x is not None]
                
                if file == 'newegg.txt':   
                    for href in hrefs:
                        if href.startswith('http://www.newegg.com/Product/Product.aspx?Item='):
                            finalListOfUrls_newegg.append(href)
                elif file == 'amazon.txt':
                    for href in hrefs:
                        if href.endswith('keywords=samsung') and href.startswith('http://www.amazon.com/'):
                            finalListOfUrls_amazon.append(href)
                elif file == 'target.txt':
                    for href in hrefs:
                        if href.startswith('http://www.target.com/') and 'prodSlot=medium' in href:
                            finalListOfUrls_target.append(href)
                elif file == 'walmart.txt':
                    for href in hrefs:
                        if '/ip/' in href:
                            temp_href = 'http://www.walmart.com' + href
                            finalListOfUrls_walmart.append(temp_href)
                else:
                    print 'input file is missing!'
                    
        finalListOfUrls_target = list(set(finalListOfUrls_target))
        finalListOfUrls_walmart = list(set(finalListOfUrls_walmart))
        finalListOfUrls_amazon = list(set(finalListOfUrls_amazon))
        finalListOfUrls_newegg = list(set(finalListOfUrls_newegg))
        
        f = open('output.txt', 'wb')
        for index in range(250):
            finalListOfUrls_target[index] = finalListOfUrls_target[index].strip()
            f.write(finalListOfUrls_target[index] + '\n')
            
            finalListOfUrls_walmart[index] = finalListOfUrls_walmart[index].strip()
            f.write(finalListOfUrls_walmart[index] + '\n')
            
            finalListOfUrls_amazon[index] = finalListOfUrls_amazon[index].strip()
            f.write(finalListOfUrls_amazon[index] + '\n')
        
        
        f_dash = open('output2.txt', 'wb')
        for index in range(250):
            finalListOfUrls_newegg[index] = finalListOfUrls_newegg[index].strip()
            f_dash.write(finalListOfUrls_newegg[index] + '\n')
            
        f.close()
        f_dash.close()
        
        return
    
if __name__ == '__main__':
    crawler = WebCrawler()
    file_list = ['newegg.txt', 'walmart.txt', 'amazon.txt', 'target.txt']
    crawler.main(file_list)
            
            

                    
            
        
    
    
    
    
    
    
