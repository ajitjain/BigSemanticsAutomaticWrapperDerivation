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
        finalListOfUrls = []
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
                filteredHrefs = []
                if file == 'newegg.txt':   
                    for href in hrefs:
                        if href.startswith('http://www.newegg.com/Product/Product.aspx?Item='):
                            filteredHrefs.append(href)
                elif file == 'amazon.txt':
                    for href in hrefs:
                        if href.endswith('keywords=samsung') and href.startswith('http://www.amazon.com/'):
                            filteredHrefs.append(href)
                elif file == 'target.txt':
                    for href in hrefs:
                        if href.startswith('http://www.target.com/') and 'prodSlot=medium' in href:
                            filteredHrefs.append(href)
                elif file == 'walmart.txt':
                    for href in hrefs:
                        if href.startswith('http://www.walmart.com/ip'):
                            filteredHrefs.append(href)
                    
                #print len(filteredHrefs)
                filteredHrefs = list(set(filteredHrefs))
                finalListOfUrls.extend(filteredHrefs)
        
        f = open('output.txt', 'wb')
        finalListOfUrls = list(set(finalListOfUrls))
        #print len(finalListOfUrls)
        for href in finalListOfUrls:
            href = href.strip()
            f.write(href + '\n')
        
        f.close()
        return
    
if __name__ == '__main__':
    crawler = WebCrawler()
    file_list = ['newegg.txt', 'walmart.txt', 'amazon.txt', 'target.txt']
    crawler.main(file_list)
            
            

                    
            
        
    
    
    
    
    
    
